import { spawnSync } from 'node:child_process';

const NIVEIS = Object.freeze({ info: 0, low: 1, moderate: 2, high: 3, critical: 4 });

function obterNivel() {
    const argumento = process.argv.find((item) => item.startsWith('--audit-level='));
    const nivel = argumento?.slice('--audit-level='.length) || 'low';

    if (!(nivel in NIVEIS)) {
        throw new Error(`Nível de auditoria inválido: ${nivel}`);
    }

    return nivel;
}

function obterAllowlist() {
    return new Set(
        String(process.env.RUNTIME_AUDIT_ALLOWLIST || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
    );
}

function obterAdvisory(via) {
    if (!via || typeof via !== 'object') return null;
    const correspondencia = String(via.url || '').match(/GHSA-[\w-]+$/u);
    return correspondencia?.[0] ?? null;
}

function criarVerificadorPermitido(vulnerabilidades, allowlist) {
    const resultados = new Map();

    function permitido(nome, visitando = new Set()) {
        if (resultados.has(nome)) return resultados.get(nome);
        if (visitando.has(nome)) return false;

        const vulnerabilidade = vulnerabilidades[nome];
        if (
            !vulnerabilidade ||
            !Array.isArray(vulnerabilidade.via) ||
            !vulnerabilidade.via.length
        ) {
            resultados.set(nome, false);
            return false;
        }

        const proximos = new Set(visitando);
        proximos.add(nome);
        const resultado = vulnerabilidade.via.every((via) => {
            if (typeof via === 'string') return permitido(via, proximos);
            const advisory = obterAdvisory(via);
            return Boolean(advisory && allowlist.has(advisory));
        });

        resultados.set(nome, resultado);
        return resultado;
    }

    return permitido;
}

function executarAuditoria() {
    const comando = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const resultado = spawnSync(comando, ['audit', '--omit=dev', '--json'], {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        shell: process.platform === 'win32'
    });

    if (resultado.error) throw resultado.error;

    try {
        return JSON.parse(resultado.stdout);
    } catch {
        process.stderr.write(resultado.stderr || resultado.stdout);
        throw new Error('O npm não retornou um relatório de auditoria JSON válido.');
    }
}

const nivel = obterNivel();
const allowlist = obterAllowlist();
const relatorio = executarAuditoria();
const vulnerabilidades = relatorio.vulnerabilities || {};
const permitido = criarVerificadorPermitido(vulnerabilidades, allowlist);
const bloqueantes = Object.entries(vulnerabilidades).filter(
    ([nome, vulnerabilidade]) =>
        NIVEIS[vulnerabilidade.severity] >= NIVEIS[nivel] && !permitido(nome)
);
const permitidas = Object.keys(vulnerabilidades).filter((nome) => permitido(nome));

if (permitidas.length) {
    console.warn(`Advisories temporariamente permitidos: ${[...allowlist].join(', ')}`);
    console.warn(`Dependências afetadas aceitas: ${permitidas.join(', ')}`);
}

if (bloqueantes.length) {
    console.error(`Vulnerabilidades de runtime em nível ${nivel} ou superior:`);
    for (const [nome, vulnerabilidade] of bloqueantes) {
        console.error(`- ${nome}: ${vulnerabilidade.severity} (${vulnerabilidade.range})`);
    }
    process.exitCode = 1;
} else {
    console.info(`Nenhuma vulnerabilidade de runtime não aceita em nível ${nivel} ou superior.`);
}
