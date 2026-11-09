import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { DatabaseSync as Database } from 'node:sqlite';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import express from 'express';

import { criarContactLinkController } from '../../../../src/features/support-network/controllers/contactLink.controller.js';
import { criarContactLinkRoutes } from '../../../../src/features/support-network/routes/contactLink.routes.js';
import { criarContactLinkService } from '../../../../src/features/support-network/services/contactLink.service.js';
import { criarContactLinkValidator } from '../../../../src/features/support-network/validators/contactLink.validator.js';
import { criarSupportContactValidator } from '../../../../src/features/support-network/validators/supportContact.validator.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const { PrismaClient } = prismaPackage;
const AGORA = new Date('2026-11-09T12:00:00.000Z');
const MIGRACAO_INICIAL = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20260913221156_estrutura_inicial/migration.sql',
        import.meta.url
    )
);
const MIGRACAO_NOMES = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20260925015114_normalizar_nome_categoria_permissao/migration.sql',
        import.meta.url
    )
);
const MIGRACAO_APARENCIA_CONTATO = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20261108020000_adicionar_aparencia_contato/migration.sql',
        import.meta.url
    )
);

function criarBanco() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-vinculo-'));
    const caminho = join(diretorio, 'teste.db');
    const banco = new Database(caminho);
    banco.exec('PRAGMA foreign_keys = ON');
    banco.exec(readFileSync(MIGRACAO_INICIAL, 'utf8'));
    banco.exec(readFileSync(MIGRACAO_NOMES, 'utf8'));
    banco.exec(readFileSync(MIGRACAO_APARENCIA_CONTATO, 'utf8'));
    banco.exec(`
        INSERT INTO usuarios (id, nome, data_nascimento, email, senha_hash, papel, status_conta, criado_em, atualizado_em)
        VALUES
            (1, 'Titular', '2000-01-01T00:00:00.000Z', 'titular@example.com', 'hash', 'principal', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (2, 'Ana', '1990-01-01T00:00:00.000Z', 'ana@example.com', 'hash', 'contato_apoio', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (3, 'Bia', '1991-01-01T00:00:00.000Z', 'bia@example.com', 'hash', 'contato_apoio', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        INSERT INTO categorias_permissao (id, titular_id, nome, nome_normalizado, conjunto_dados_visiveis, criado_em, atualizado_em)
        VALUES
            (10, 1, 'Família', 'família', '["geral.fase_atual","saude.consultas"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (11, 1, 'Profissional', 'profissional', '["geral.historico_ciclo"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        INSERT INTO vinculos_rede_apoio
            (id, titular_id, contato_id, email_convidado, categoria_id, permissoes_individuais, status, data_envio, data_resposta, criado_em, atualizado_em)
        VALUES
            (20, 1, 2, 'ana@example.com', 10, '[]', 'ativo', '2026-10-01T12:00:00.000Z', '2026-10-02T12:00:00.000Z', CURRENT_TIMESTAMP, '2026-11-08T12:00:00.000Z'),
            (21, 1, 3, 'bia@example.com', NULL, '["geral.fase_atual"]', 'ativo', '2026-10-01T12:00:00.000Z', '2026-10-02T12:00:00.000Z', CURRENT_TIMESTAMP, '2026-11-08T13:00:00.000Z'),
            (22, 1, NULL, 'pendente@example.com', 10, '[]', 'pendente', '2026-10-01T12:00:00.000Z', NULL, CURRENT_TIMESTAMP, '2026-11-08T14:00:00.000Z');
    `);
    banco.close();
    return { diretorio, caminho };
}

function criarApp(prisma) {
    const service = criarContactLinkService({ prisma, now: () => AGORA });
    const controller = criarContactLinkController({
        service,
        contactValidator: criarSupportContactValidator(),
        linkValidator: criarContactLinkValidator()
    });
    const app = express();
    app.use(express.json());
    app.use(
        '/support-network',
        criarContactLinkRoutes({
            Router: express.Router,
            authMiddleware: {
                autenticar(req, _res, next) {
                    req.usuario = { id: 1, papel: 'principal' };
                    next();
                }
            },
            parentalConsentMiddleware: {
                exigirAcessoRedeApoio(_req, _res, next) {
                    next();
                }
            },
            rateLimit(_req, _res, next) {
                next();
            },
            controller
        })
    );
    app.use(tratarErros);
    return app;
}

async function executarComBanco(callback) {
    const { diretorio, caminho } = criarBanco();
    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` })
    });
    await prisma.vinculoRedeApoio.update({
        where: { id: 20 },
        data: { atualizadoEm: new Date('2026-11-08T12:00:00.000Z') }
    });
    await prisma.vinculoRedeApoio.update({
        where: { id: 21 },
        data: { atualizadoEm: new Date('2026-11-08T13:00:00.000Z') }
    });
    await prisma.vinculoRedeApoio.update({
        where: { id: 22 },
        data: { atualizadoEm: new Date('2026-11-08T14:00:00.000Z') }
    });
    const servidor = criarApp(prisma).listen(0, '127.0.0.1');
    try {
        await once(servidor, 'listening');
        const baseUrl = `http://127.0.0.1:${servidor.address().port}/support-network`;
        await callback({ baseUrl, prisma });
    } finally {
        servidor.close();
        await once(servidor, 'close');
        await prisma.$disconnect();
        rmSync(diretorio, { recursive: true, force: true });
    }
}

test('consulta categoria ativa e a converte em permissão individual alterada', async () => {
    await executarComBanco(async ({ baseUrl, prisma }) => {
        const consulta = await fetch(`${baseUrl}/contacts/20/link`);
        const configuracao = await consulta.json();

        assert.equal(consulta.status, 200);
        assert.equal(configuracao.vinculoAtual.tipo, 'categoria');
        assert.deepEqual(configuracao.proximoVinculo.permissoesPreenchidas, [
            'geral.fase_atual',
            'saude.consultas'
        ]);

        const atualizacao = await fetch(`${baseUrl}/contacts/20/link`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: 'individual',
                permissoesIndividuais: ['geral.fase_atual'],
                versao: configuracao.versao
            })
        });
        const corpo = await atualizacao.json();
        const vinculo = await prisma.vinculoRedeApoio.findUnique({ where: { id: 20 } });
        const notificacoes = await prisma.notificacao.findMany({ where: { usuarioId: 2 } });

        assert.equal(atualizacao.status, 200, JSON.stringify(corpo));
        assert.equal(corpo.mensagem, 'Vínculo atualizado com sucesso.');
        assert.equal(vinculo.categoriaId, null);
        assert.deepEqual(vinculo.permissoesIndividuais, ['geral.fase_atual']);
        assert.equal(notificacoes.length, 1);
        assert.equal(notificacoes[0].tipoOrigem, 'rede_apoio');
        assert.equal(notificacoes[0].origemId, 20);
    });
});

test('consulta categorias e substitui permissões individuais pela categoria escolhida', async () => {
    await executarComBanco(async ({ baseUrl, prisma }) => {
        const consulta = await fetch(`${baseUrl}/contacts/21/link`);
        const configuracao = await consulta.json();

        assert.equal(configuracao.vinculoAtual.tipo, 'individual');
        assert.deepEqual(
            configuracao.proximoVinculo.categorias.map(({ nome }) => nome),
            ['Família', 'Profissional']
        );

        const atualizacao = await fetch(`${baseUrl}/contacts/21/link`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: 'categoria',
                categoriaId: 11,
                versao: configuracao.versao
            })
        });
        const corpo = await atualizacao.json();
        const vinculo = await prisma.vinculoRedeApoio.findUnique({ where: { id: 21 } });

        assert.equal(atualizacao.status, 200, JSON.stringify(corpo));
        assert.equal(vinculo.categoriaId, 11);
        assert.deepEqual(vinculo.permissoesIndividuais, []);
    });
});

test('impede consulta e alteração de convite pendente', async () => {
    await executarComBanco(async ({ baseUrl, prisma }) => {
        const antes = await prisma.vinculoRedeApoio.findUnique({ where: { id: 22 } });
        const consulta = await fetch(`${baseUrl}/contacts/22/link`);
        const atualizacao = await fetch(`${baseUrl}/contacts/22/link`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: 'individual',
                permissoesIndividuais: ['geral.fase_atual'],
                versao: antes.atualizadoEm.toISOString()
            })
        });
        const depois = await prisma.vinculoRedeApoio.findUnique({ where: { id: 22 } });

        assert.equal(consulta.status, 404);
        assert.equal(atualizacao.status, 404);
        assert.equal(depois.categoriaId, antes.categoriaId);
        assert.deepEqual(depois.permissoesIndividuais, antes.permissoesIndividuais);
    });
});

test('desfaz a permissão quando a notificação não pode ser agendada', async () => {
    await executarComBanco(async ({ baseUrl, prisma }) => {
        const consulta = await fetch(`${baseUrl}/contacts/20/link`);
        const configuracao = await consulta.json();
        await prisma.$executeRawUnsafe(`
            CREATE TRIGGER impedir_notificacao_vinculo
            BEFORE INSERT ON notificacoes
            BEGIN
                SELECT RAISE(ABORT, 'falha simulada');
            END;
        `);

        const atualizacao = await fetch(`${baseUrl}/contacts/20/link`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: 'individual',
                permissoesIndividuais: ['geral.fase_atual'],
                versao: configuracao.versao
            })
        });
        const corpo = await atualizacao.json();
        const vinculo = await prisma.vinculoRedeApoio.findUnique({ where: { id: 20 } });

        assert.equal(atualizacao.status, 500);
        assert.equal(
            corpo.erro.mensagem,
            'Não foi possível atualizar o vínculo deste contato. Tente novamente.'
        );
        assert.equal(vinculo.categoriaId, 10);
        assert.deepEqual(vinculo.permissoesIndividuais, []);
    });
});
