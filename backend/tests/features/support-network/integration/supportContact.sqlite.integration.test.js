import assert from 'node:assert/strict';
import crypto from 'node:crypto';
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

import { criarSupportContactController } from '../../../../src/features/support-network/controllers/supportContact.controller.js';
import { criarSupportContactRoutes } from '../../../../src/features/support-network/routes/supportContact.routes.js';
import { criarContactInvitationResendService } from '../../../../src/features/support-network/services/contactInvitationResend.service.js';
import { criarContactInvitationTokenService } from '../../../../src/features/support-network/services/contactInvitationToken.service.js';
import { criarSupportContactService } from '../../../../src/features/support-network/services/supportContact.service.js';
import { criarSupportContactValidator } from '../../../../src/features/support-network/validators/supportContact.validator.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const { PrismaClient } = prismaPackage;
const AGORA = new Date('2026-11-08T12:00:00.000Z');
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
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-contatos-'));
    const caminho = join(diretorio, 'teste.db');
    const banco = new Database(caminho);
    banco.exec('PRAGMA foreign_keys = ON');
    banco.exec(readFileSync(MIGRACAO_INICIAL, 'utf8'));
    banco.exec(readFileSync(MIGRACAO_NOMES, 'utf8'));
    banco.exec(readFileSync(MIGRACAO_APARENCIA_CONTATO, 'utf8'));
    banco.exec(`
        INSERT INTO usuarios (id, nome, data_nascimento, email, senha_hash, papel, status_conta, criado_em, atualizado_em)
        VALUES
            (1, 'Titular Ana', '2000-01-01T00:00:00.000Z', 'titular@example.com', 'hash', 'principal', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (2, 'Zélia', '1990-01-01T00:00:00.000Z', 'zelia@example.com', 'hash', 'contato_apoio', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (3, 'Rafael', '1991-01-01T00:00:00.000Z', 'rafael@example.com', 'hash', 'contato_apoio', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (4, 'Outro Titular', '1992-01-01T00:00:00.000Z', 'outro@example.com', 'hash', 'principal', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        INSERT INTO categorias_permissao (id, titular_id, nome, nome_normalizado, conjunto_dados_visiveis, criado_em, atualizado_em)
        VALUES (10, 1, 'Profissional', 'profissional', '["geral.fase_atual","saude.consultas"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        INSERT INTO vinculos_rede_apoio
            (id, titular_id, contato_id, email_convidado, categoria_id, permissoes_individuais, status, token_convite_hash, data_envio, data_expiracao, data_resposta, criado_em, atualizado_em)
        VALUES
            (20, 1, 2, 'zelia@example.com', NULL, '["geral.historico_ciclo"]', 'ativo', NULL, '2026-10-01T12:00:00.000Z', NULL, '2026-10-02T12:00:00.000Z', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (21, 1, 3, 'rafael@example.com', 10, '[]', 'pendente', 'hash-antigo', '2026-10-30T12:00:00.000Z', '2026-11-06T12:00:00.000Z', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (22, 1, NULL, 'ana@email.com', NULL, '["geral.fase_atual"]', 'pendente', 'hash-ana', '2026-11-07T12:00:00.000Z', '2026-11-14T12:00:00.000Z', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (23, 1, NULL, 'recusado@email.com', NULL, '[]', 'recusado', NULL, '2026-10-01T12:00:00.000Z', NULL, '2026-10-02T12:00:00.000Z', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (24, 4, NULL, 'alheio@email.com', NULL, '[]', 'pendente', 'hash-alheio', '2026-10-01T12:00:00.000Z', '2026-10-08T12:00:00.000Z', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);
    banco.close();
    return { diretorio, caminho };
}

function criarApp(prisma, emails) {
    const tokenService = criarContactInvitationTokenService({
        crypto,
        baseUrl: 'aloya://support-network/invitation',
        now: () => AGORA
    });
    const service = criarSupportContactService({ prisma, now: () => AGORA });
    const resendService = criarContactInvitationResendService({
        prisma,
        tokenService,
        emailService: {
            async enviarConviteRedeApoio(dados) {
                emails.push(dados);
            }
        },
        now: () => AGORA
    });
    const controller = criarSupportContactController({
        service,
        resendService,
        validator: criarSupportContactValidator()
    });
    const app = express();
    app.use(
        '/support-network',
        criarSupportContactRoutes({
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

test('lista contatos reais com isolamento, ordem, vínculo e espera calculada', async () => {
    const { diretorio, caminho } = criarBanco();
    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` })
    });
    const servidor = criarApp(prisma, []).listen(0, '127.0.0.1');

    try {
        await once(servidor, 'listening');
        const resposta = await fetch(
            `http://127.0.0.1:${servidor.address().port}/support-network/contacts`
        );
        const corpo = await resposta.json();

        assert.equal(resposta.status, 200);
        assert.equal(resposta.headers.get('cache-control'), 'private, no-store');
        assert.deepEqual(corpo.resumo, { total: 3, pendentes: 2, ativos: 1 });
        assert.deepEqual(
            corpo.contatos.map(({ id }) => id),
            [22, 21, 20]
        );
        assert.equal(corpo.contatos[0].identificacao, 'ana@email.com');
        assert.equal(corpo.contatos[1].vinculo.rotulo, 'Categoria: Profissional');
        assert.deepEqual(corpo.contatos[1].vinculo.permissoes, [
            'geral.fase_atual',
            'saude.consultas'
        ]);
        assert.equal(corpo.contatos[1].aguardando.atrasado, true);
        assert.equal(corpo.contatos[2].acoes.podeReenviarConvite, false);
        assert.equal(
            corpo.contatos.some(({ id }) => id === 23 || id === 24),
            false
        );
    } finally {
        servidor.close();
        await once(servidor, 'close');
        await prisma.$disconnect();
        rmSync(diretorio, { recursive: true, force: true });
    }
});

test('reenvia convite pendente e persiste a nova janela sem criar outro vínculo', async () => {
    const { diretorio, caminho } = criarBanco();
    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` })
    });
    const emails = [];
    const servidor = criarApp(prisma, emails).listen(0, '127.0.0.1');

    try {
        await once(servidor, 'listening');
        const resposta = await fetch(
            `http://127.0.0.1:${servidor.address().port}/support-network/contacts/21/resend-invitation`,
            { method: 'POST' }
        );
        const corpo = await resposta.json();
        const vinculos = await prisma.vinculoRedeApoio.findMany({
            where: { titularId: 1, emailConvidado: 'rafael@example.com' }
        });

        assert.equal(resposta.status, 200);
        assert.equal(corpo.mensagem, 'Convite reenviado com sucesso.');
        assert.equal(vinculos.length, 1);
        assert.equal(vinculos[0].dataEnvio.toISOString(), AGORA.toISOString());
        assert.notEqual(vinculos[0].tokenConviteHash, 'hash-antigo');
        assert.equal(emails.length, 1);
        assert.equal(emails[0].email, 'rafael@example.com');
    } finally {
        servidor.close();
        await once(servidor, 'close');
        await prisma.$disconnect();
        rmSync(diretorio, { recursive: true, force: true });
    }
});
