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

import { criarSupportContactRemovalController } from '../../../../src/features/support-network/controllers/supportContactRemoval.controller.js';
import { criarSupportContactRemovalRoutes } from '../../../../src/features/support-network/routes/supportContactRemoval.routes.js';
import { criarSupportContactRemovalService } from '../../../../src/features/support-network/services/supportContactRemoval.service.js';
import { criarSupportContactRemovalValidator } from '../../../../src/features/support-network/validators/supportContactRemoval.validator.js';
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

function criarBanco() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-remocao-contato-'));
    const caminho = join(diretorio, 'teste.db');
    const banco = new Database(caminho);
    banco.exec('PRAGMA foreign_keys = ON');
    banco.exec(readFileSync(MIGRACAO_INICIAL, 'utf8'));
    banco.exec(readFileSync(MIGRACAO_NOMES, 'utf8'));
    banco.exec(`
        INSERT INTO usuarios (id, nome, data_nascimento, email, senha_hash, papel, status_conta, criado_em, atualizado_em)
        VALUES
            (1, 'Titular', '2000-01-01T00:00:00.000Z', 'titular@example.com', 'hash', 'principal', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (2, 'Ana', '1990-01-01T00:00:00.000Z', 'ana@example.com', 'hash', 'contato_apoio', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (3, 'Bia', '1991-01-01T00:00:00.000Z', 'bia@example.com', 'hash', 'contato_apoio', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        INSERT INTO categorias_permissao (id, titular_id, nome, nome_normalizado, conjunto_dados_visiveis, criado_em, atualizado_em)
        VALUES (10, 1, 'Família', 'família', '["geral.fase_atual"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        INSERT INTO vinculos_rede_apoio
            (id, titular_id, contato_id, email_convidado, categoria_id, permissoes_individuais, status, token_convite_hash, data_envio, data_expiracao, data_resposta, criado_em, atualizado_em)
        VALUES
            (20, 1, 2, 'ana@example.com', 10, '[]', 'ativo', NULL, '2026-10-01T12:00:00.000Z', NULL, '2026-10-02T12:00:00.000Z', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (21, 1, 3, 'bia@example.com', 10, '[]', 'ativo', NULL, '2026-10-01T12:00:00.000Z', NULL, '2026-10-02T12:00:00.000Z', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (22, 1, NULL, 'pendente@example.com', 10, '[]', 'pendente', 'token-pendente', '2026-11-01T12:00:00.000Z', '2026-12-01T12:00:00.000Z', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        INSERT INTO sessoes (id, usuario_id, token_sessao_hash, dispositivo, validade_sessao, revogada_em, criado_em, atualizado_em)
        VALUES
            (30, 2, 'sessao-ativa', 'celular', '2026-12-09T12:00:00.000Z', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (31, 2, 'sessao-expirada', 'tablet', '2026-10-09T12:00:00.000Z', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (32, 3, 'sessao-bia', 'celular', '2026-12-09T12:00:00.000Z', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        INSERT INTO notificacoes (id, usuario_id, tipo_origem, origem_id, data_hora_programada, status_envio, criado_em)
        VALUES (40, 2, 'rede_apoio', 20, '2026-11-10T12:00:00.000Z', 'agendada', CURRENT_TIMESTAMP);
    `);
    banco.close();
    return { diretorio, caminho };
}

function criarApp(prisma) {
    const service = criarSupportContactRemovalService({ prisma, now: () => AGORA });
    const controller = criarSupportContactRemovalController({
        service,
        contactValidator: criarSupportContactValidator(),
        removalValidator: criarSupportContactRemovalValidator()
    });
    const app = express();
    app.use(express.json());
    app.use(
        '/support-network',
        criarSupportContactRemovalRoutes({
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

async function remover(baseUrl, contatoId, body = { confirmado: true }) {
    return fetch(`${baseUrl}/contacts/${contatoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}

test('remove contato ativo, encerra sessões e preserva os demais vínculos da categoria', async () => {
    await executarComBanco(async ({ baseUrl, prisma }) => {
        const resposta = await remover(baseUrl, 20);
        const corpo = await resposta.json();
        const removido = await prisma.vinculoRedeApoio.findUnique({ where: { id: 20 } });
        const preservado = await prisma.vinculoRedeApoio.findUnique({ where: { id: 21 } });
        const sessoesAna = await prisma.sessao.findMany({
            where: { usuarioId: 2 },
            orderBy: { id: 'asc' }
        });
        const sessaoBia = await prisma.sessao.findUnique({ where: { id: 32 } });
        const notificacoes = await prisma.notificacao.findMany({
            where: { usuarioId: 2, origemId: 20 },
            orderBy: { id: 'asc' }
        });

        assert.equal(resposta.status, 200, JSON.stringify(corpo));
        assert.equal(corpo.mensagem, 'Contato removido com sucesso.');
        assert.deepEqual(corpo.remocao, {
            id: 20,
            status: 'revogado',
            sessoesEncerradas: 1,
            alertasCancelados: 1
        });
        assert.equal(removido.status, 'revogado');
        assert.equal(removido.categoriaId, null);
        assert.deepEqual(removido.permissoesIndividuais, []);
        assert.equal(preservado.status, 'ativo');
        assert.equal(preservado.categoriaId, 10);
        assert.equal(sessoesAna[0].revogadaEm.toISOString(), AGORA.toISOString());
        assert.equal(sessoesAna[1].revogadaEm, null);
        assert.equal(sessaoBia.revogadaEm, null);
        assert.equal(notificacoes[0].statusEnvio, 'cancelada');
        assert.equal(notificacoes[1].statusEnvio, 'agendada');
        assert.equal(notificacoes[1].dataHoraProgramada.toISOString(), AGORA.toISOString());
    });
});

test('cancela convite pendente sem criar sessão ou acesso', async () => {
    await executarComBanco(async ({ baseUrl, prisma }) => {
        const resposta = await remover(baseUrl, 22);
        const corpo = await resposta.json();
        const vinculo = await prisma.vinculoRedeApoio.findUnique({ where: { id: 22 } });

        assert.equal(resposta.status, 200, JSON.stringify(corpo));
        assert.equal(vinculo.status, 'revogado');
        assert.equal(vinculo.tokenConviteHash, null);
        assert.equal(vinculo.dataExpiracao, null);
        assert.equal(vinculo.dataResposta.toISOString(), AGORA.toISOString());
        assert.equal(corpo.remocao.sessoesEncerradas, 0);
        assert.equal(corpo.remocao.alertasCancelados, 0);
    });
});

test('não altera contato quando a confirmação não foi enviada', async () => {
    await executarComBanco(async ({ baseUrl, prisma }) => {
        const resposta = await remover(baseUrl, 20, { confirmado: false });
        const corpo = await resposta.json();
        const vinculo = await prisma.vinculoRedeApoio.findUnique({ where: { id: 20 } });
        const sessao = await prisma.sessao.findUnique({ where: { id: 30 } });

        assert.equal(resposta.status, 422);
        assert.equal(corpo.erro.codigo, 'ERRO_VALIDACAO');
        assert.equal(vinculo.status, 'ativo');
        assert.equal(vinculo.categoriaId, 10);
        assert.equal(sessao.revogadaEm, null);
    });
});

test('desfaz revogação quando a notificação não pode ser criada', async () => {
    await executarComBanco(async ({ baseUrl, prisma }) => {
        await prisma.$executeRawUnsafe(`
            CREATE TRIGGER impedir_notificacao_remocao
            BEFORE INSERT ON notificacoes
            BEGIN
                SELECT RAISE(ABORT, 'falha simulada');
            END;
        `);

        const resposta = await remover(baseUrl, 20);
        const corpo = await resposta.json();
        const vinculo = await prisma.vinculoRedeApoio.findUnique({ where: { id: 20 } });
        const sessao = await prisma.sessao.findUnique({ where: { id: 30 } });
        const alerta = await prisma.notificacao.findUnique({ where: { id: 40 } });

        assert.equal(resposta.status, 500);
        assert.equal(
            corpo.erro.mensagem,
            'Não foi possível remover este contato. Tente novamente.'
        );
        assert.equal(vinculo.status, 'ativo');
        assert.equal(vinculo.categoriaId, 10);
        assert.equal(sessao.revogadaEm, null);
        assert.equal(alerta.statusEnvio, 'agendada');
    });
});
