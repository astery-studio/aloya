import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import Database from 'better-sqlite3';

const pastaMigrations = fileURLToPath(new URL('../../../../prisma/migrations/', import.meta.url));

function criarBanco() {
    const banco = new Database(':memory:');
    banco.pragma('foreign_keys = ON');

    for (const entrada of readdirSync(pastaMigrations, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))) {
        banco.exec(readFileSync(join(pastaMigrations, entrada.name, 'migration.sql'), 'utf8'));
    }

    banco
        .prepare(
            `INSERT INTO usuarios (
            id, nome, data_nascimento, email, senha_hash, papel,
            status_conta, atualizado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
            1,
            'Titular',
            '2000-01-01T00:00:00.000Z',
            'titular@email.com',
            'hash-seguro',
            'principal',
            'ativo',
            '2026-11-08T00:00:00.000Z'
        );

    return banco;
}

function inserirVinculo(banco, { email, status, token }) {
    return banco
        .prepare(
            `INSERT INTO vinculos_rede_apoio (
                titular_id, email_convidado, status, token_convite_hash,
                atualizado_em
            ) VALUES (?, ?, ?, ?, ?)`
        )
        .run(1, email, status, token, '2026-11-08T00:00:00.000Z');
}

test('impede convites pendentes ou ativos duplicados no próprio banco', () => {
    const banco = criarBanco();

    try {
        inserirVinculo(banco, {
            email: 'contato@email.com',
            status: 'pendente',
            token: 'token-1'
        });

        assert.throws(
            () =>
                inserirVinculo(banco, {
                    email: 'contato@email.com',
                    status: 'pendente',
                    token: 'token-2'
                }),
            /UNIQUE constraint failed/
        );

        assert.throws(
            () =>
                inserirVinculo(banco, {
                    email: 'contato@email.com',
                    status: 'ativo',
                    token: 'token-3'
                }),
            /UNIQUE constraint failed/
        );
    } finally {
        banco.close();
    }
});

test('preserva histórico e permite novo convite após revogação', () => {
    const banco = criarBanco();

    try {
        inserirVinculo(banco, {
            email: 'contato@email.com',
            status: 'revogado',
            token: 'token-historico'
        });
        inserirVinculo(banco, {
            email: 'contato@email.com',
            status: 'pendente',
            token: 'token-novo'
        });

        const registros = banco
            .prepare(
                `SELECT status
                 FROM vinculos_rede_apoio
                 WHERE titular_id = ? AND email_convidado = ?
                 ORDER BY id`
            )
            .all(1, 'contato@email.com');

        assert.deepEqual(registros, [{ status: 'revogado' }, { status: 'pendente' }]);
    } finally {
        banco.close();
    }
});
