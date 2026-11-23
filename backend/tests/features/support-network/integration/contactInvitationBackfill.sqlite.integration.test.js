import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import Database from 'better-sqlite3';

const migrationInicial = new URL(
    '../../../../prisma/migrations/20260913221156_estrutura_inicial/migration.sql',
    import.meta.url
);
const migrationAssociacao = new URL(
    '../../../../prisma/migrations/20261112120000_associar_convites_pendentes_contas_ativas/migration.sql',
    import.meta.url
);

test('associa convites pendentes antigos somente a contas ativas do mesmo e-mail', () => {
    const banco = new Database(':memory:');

    try {
        banco.exec(readFileSync(migrationInicial, 'utf8'));

        const inserirUsuario = banco.prepare(`
            INSERT INTO usuarios (
                nome, data_nascimento, email, senha_hash, papel, status_conta, atualizado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const titularId = inserirUsuario.run(
            'Titular',
            '2000-01-01',
            'titular@aloya.test',
            'hash',
            'principal',
            'ativa',
            '2026-11-12'
        ).lastInsertRowid;
        const contatoAtivoId = inserirUsuario.run(
            'Contato ativo',
            '2000-01-01',
            ' Contato@Aloya.Test ',
            'hash',
            'principal',
            'ativa',
            '2026-11-12'
        ).lastInsertRowid;
        inserirUsuario.run(
            'Contato inativo',
            '2000-01-01',
            'inativo@aloya.test',
            'hash',
            'contato_apoio',
            'desativada',
            '2026-11-12'
        );

        const inserirConvite = banco.prepare(`
            INSERT INTO vinculos_rede_apoio (
                titular_id, email_convidado, status, token_convite_hash, atualizado_em
            ) VALUES (?, ?, 'pendente', ?, ?)
        `);
        const conviteAtivoId = inserirConvite.run(
            titularId,
            'contato@aloya.test',
            'token-ativo',
            '2026-11-12'
        ).lastInsertRowid;
        const conviteInativoId = inserirConvite.run(
            titularId,
            'inativo@aloya.test',
            'token-inativo',
            '2026-11-12'
        ).lastInsertRowid;

        banco.exec(readFileSync(migrationAssociacao, 'utf8'));

        const buscarContato = banco.prepare(
            'SELECT contato_id AS contatoId FROM vinculos_rede_apoio WHERE id = ?'
        );

        assert.equal(buscarContato.get(conviteAtivoId).contatoId, contatoAtivoId);
        assert.equal(buscarContato.get(conviteInativoId).contatoId, null);
    } finally {
        banco.close();
    }
});
