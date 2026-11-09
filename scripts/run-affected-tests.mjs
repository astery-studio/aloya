import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = join(root, 'backend');
const frontend = join(root, 'frontend');
const zeroSha = /^0+$/;
const dryRun = process.argv.includes('--dry-run');

function git(args) {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    return result.status === 0 ? result.stdout.trim() : null;
}

function baseFor(localSha, remoteSha) {
    if (!zeroSha.test(remoteSha)) return remoteSha;

    for (const branch of ['origin/develop', 'origin/main', 'develop', 'main']) {
        const base = git(['merge-base', branch, localSha]);
        if (base) return base;
    }

    return null;
}

function changedFiles(updates) {
    const files = new Set();

    for (const update of updates) {
        const [, localSha, , remoteSha] = update.split(/\s+/);
        if (!localSha || !remoteSha || zeroSha.test(localSha)) continue;

        const base = baseFor(localSha, remoteSha);
        if (!base) return null;

        const output = git(['diff', '--name-only', '--diff-filter=ACDMRT', base, localSha]);
        if (output === null) return null;
        output
            .split(/\r?\n/)
            .filter(Boolean)
            .forEach((file) => files.add(file.replaceAll('\\', '/')));
    }

    return [...files];
}

function testsInside(directory) {
    if (!existsSync(directory)) return [];

    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return testsInside(path);
        return entry.isFile() && /\.test\.js$/.test(entry.name) ? [path] : [];
    });
}

function dependentFeatures(feature) {
    const featuresRoot = join(backend, 'src', 'features');
    const dependencies = new Map();

    for (const sourceFile of sourceFilesInside(featuresRoot)) {
        const owner = relative(featuresRoot, sourceFile).split(/[\\/]/)[0];
        const source = readFileSync(sourceFile, 'utf8');

        for (const match of source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
            if (!match[1].startsWith('.')) continue;
            const imported = relative(featuresRoot, resolve(dirname(sourceFile), match[1]));
            const dependency = imported.split(/[\\/]/)[0];
            if (imported.startsWith('..') || dependency === owner) continue;

            if (!dependencies.has(dependency)) dependencies.set(dependency, new Set());
            dependencies.get(dependency).add(owner);
        }
    }

    const affected = new Set([feature]);
    const pending = [feature];
    while (pending.length > 0) {
        for (const dependent of dependencies.get(pending.pop()) ?? []) {
            if (affected.has(dependent)) continue;
            affected.add(dependent);
            pending.push(dependent);
        }
    }

    return affected;
}

function sourceFilesInside(directory) {
    if (!existsSync(directory)) return [];

    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return sourceFilesInside(path);
        return entry.isFile() && entry.name.endsWith('.js') ? [path] : [];
    });
}

function createPlan(files) {
    if (files === null) return { backendFull: true, frontendFull: true };

    const plan = {
        backendFull: false,
        backendFeatures: new Set(),
        backendTests: new Set(),
        frontendFull: false,
        frontendConfig: false,
        frontendSources: new Set(),
        frontendTests: new Set()
    };

    for (const file of files) {
        if (file === 'package-lock.json') {
            plan.backendFull = true;
            plan.frontendFull = true;
            continue;
        }

        if (file.startsWith('backend/')) selectBackend(file, plan);
        if (file.startsWith('frontend/')) selectFrontend(file, plan);
    }

    return plan;
}

function selectBackend(file, plan) {
    if (
        file === 'backend/package.json' ||
        file === 'backend/package-lock.json' ||
        file.startsWith('backend/prisma/') ||
        file.startsWith('backend/src/shared/')
    ) {
        plan.backendFull = true;
        return;
    }

    const sourceFeature = file.match(/^backend\/src\/features\/([^/]+)\//)?.[1];
    if (sourceFeature) {
        dependentFeatures(sourceFeature).forEach((feature) => plan.backendFeatures.add(feature));
        return;
    }

    if (file.startsWith('backend/tests/')) {
        if (/\.test\.js$/.test(file)) {
            const path = resolve(root, file);
            if (existsSync(path)) plan.backendTests.add(path);
        } else {
            const testFeature = file.match(/^backend\/tests\/features\/([^/]+)\//)?.[1];
            if (testFeature) plan.backendFeatures.add(testFeature);
            else plan.backendFull = true;
        }
        return;
    }

    if (file.startsWith('backend/src/')) plan.backendFull = true;
}

function selectFrontend(file, plan) {
    if (
        file === 'frontend/package.json' ||
        file === 'frontend/package-lock.json' ||
        /^frontend\/(babel|jest|metro)\.config\./.test(file) ||
        /^frontend\/(app\.json|eas\.json)$/.test(file)
    ) {
        plan.frontendFull = true;
        return;
    }

    if (file === 'frontend/app.config.js' || file === 'frontend/app.config.test.cjs') {
        plan.frontendConfig = true;
        return;
    }

    if (!file.startsWith('frontend/src/') && !file.startsWith('frontend/tests/')) return;

    const path = resolve(root, file);
    if (!existsSync(path)) {
        plan.frontendFull = true;
    } else if (/\.test\.(js|jsx)$/.test(file)) {
        plan.frontendTests.add(path);
    } else if (/\.(js|jsx)$/.test(file)) {
        plan.frontendSources.add(path);
    } else {
        plan.frontendFull = true;
    }
}

function tasksFor(plan) {
    const tasks = [];

    if (plan.backendFull) {
        tasks.push({ label: 'Backend completo', cwd: backend, args: ['--test'] });
    } else {
        let missingFeatureTests = false;
        for (const feature of plan.backendFeatures ?? []) {
            const featureTests = testsInside(join(backend, 'tests', 'features', feature));
            if (featureTests.length === 0) missingFeatureTests = true;
            featureTests.forEach((test) => plan.backendTests.add(test));
        }

        if (missingFeatureTests) {
            tasks.push({ label: 'Backend completo', cwd: backend, args: ['--test'] });
        } else if (plan.backendTests?.size) {
            tasks.push({
                label: `${plan.backendTests.size} teste(s) relacionado(s) do backend`,
                cwd: backend,
                args: [
                    '--test',
                    ...[...plan.backendTests].sort().map((test) => relative(backend, test))
                ]
            });
        }
    }

    const jest = join(frontend, 'node_modules', 'jest', 'bin', 'jest.js');
    if (plan.frontendFull) {
        tasks.push({ label: 'Frontend completo', cwd: frontend, args: [jest, '--runInBand'] });
    } else {
        if (plan.frontendConfig) {
            tasks.push({
                label: 'Configuração do Expo',
                cwd: frontend,
                args: ['--test', 'app.config.test.cjs']
            });
        }
        if (plan.frontendTests?.size) {
            tasks.push({
                label: `${plan.frontendTests.size} teste(s) alterado(s) do frontend`,
                cwd: frontend,
                args: [jest, '--runInBand', '--runTestsByPath', ...plan.frontendTests]
            });
        }
        if (plan.frontendSources?.size) {
            tasks.push({
                label: `Testes relacionados a ${plan.frontendSources.size} arquivo(s) do frontend`,
                cwd: frontend,
                args: [
                    jest,
                    '--runInBand',
                    '--passWithNoTests',
                    '--findRelatedTests',
                    ...plan.frontendSources
                ]
            });
        }
    }

    return tasks;
}

function run(tasks) {
    if (tasks.length === 0) {
        console.info('Nenhum teste afetado; verificações ignoradas.');
        return;
    }

    for (const task of tasks) {
        console.info(`\n${task.label}`);
        if (dryRun) continue;

        const result = spawnSync(process.execPath, task.args, { cwd: task.cwd, stdio: 'inherit' });
        if (result.error) throw result.error;
        if (result.status !== 0) process.exit(result.status ?? 1);
    }
}

async function stdin() {
    let input = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) input += chunk;
    return input;
}

const updates = (await stdin()).trim().split(/\r?\n/).filter(Boolean);
run(tasksFor(createPlan(changedFiles(updates))));
