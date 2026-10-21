import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const scriptsDirectory = fileURLToPath(new URL('.', import.meta.url));
const migrationsDirectory = join(scriptsDirectory, '..', 'prisma', 'migrations');
const migrations = readdirSync(migrationsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

assert.ok(migrations.length > 0, 'Nenhuma migration foi encontrada.');

const database = new Database(':memory:');
database.pragma('foreign_keys = ON');

try {
    for (const migration of migrations) {
        const sqlPath = join(migrationsDirectory, migration, 'migration.sql');
        const sql = readFileSync(sqlPath, 'utf8').trim();

        assert.ok(sql, `A migration ${migration} está vazia.`);
        database.exec(sql);
        console.info(`Migration validada: ${migration}`);
    }

    const integrityErrors = database.pragma('foreign_key_check');
    assert.deepEqual(integrityErrors, [], 'O banco terminou com referências inválidas.');

    const tables = database
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
        .all();

    assert.ok(tables.length > 0, 'As migrations não criaram nenhuma tabela.');
    console.info(`${migrations.length} migrations e ${tables.length} tabelas validadas.`);
} finally {
    database.close();
}
