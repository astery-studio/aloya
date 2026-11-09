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

import { criarContactInvitationController } from '../../../../src/features/support-network/controllers/contactInvitation.controller.js';
import { criarContactInvitationRoutes } from '../../../../src/features/support-network/routes/contactInvitation.routes.js';
import { criarContactInvitationPermissionService } from '../../../../src/features/support-network/services/contactInvitationPermission.service.js';
import { criarContactInvitationService } from '../../../../src/features/support-network/services/contactInvitation.service.js';
import { criarContactInvitationTokenService } from '../../../../src/features/support-network/services/contactInvitationToken.service.js';
import { criarContactInvitationValidator } from '../../../../src/features/support-network/validators/contactInvitation.validator.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const { PrismaClient } = prismaPackage;

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

const MIGRACAO_APARENCIA = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20261108020000_adicionar_aparencia_contato/migration.sql',
        import.meta.url
    )
);

function criarBanco() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-convites-'));

    const caminho = join(diretorio, 'teste.db');

    const banco = new Database(caminho);

    banco.exec('PRAGMA foreign_keys = ON');

    banco.exec(readFileSync(MIGRACAO_INICIAL, 'utf8'));

    banco.exec(readFileSync(MIGRACAO_NOMES, 'utf8'));

    banco.exec(readFileSync(MIGRACAO_APARENCIA, 'utf8'));

    banco
        .prepare(
            `
            INSERT INTO usuarios (
                id,
                nome,
                data_nascimento,
                email,
                senha_hash,
                papel,
                status_conta,
                criado_em,
                atualizado_em
            )
            VALUES
                (
                    1,
                    'Ana',
                    '2000-01-01T00:00:00.000Z',
                    'ana@example.com',
                    'hash',
                    'principal',
                    'ativa',
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                ),
                (
                    2,
                    'Bia',
                    '2000-01-01T00:00:00.000Z',
                    'bia@example.com',
                    'hash',
                    'contato_apoio',
                    'ativa',
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
            `
        )
        .run();

    banco
        .prepare(
            `
            INSERT INTO categorias_permissao (
                id,
                titular_id,
                nome,
                nome_normalizado,
                conjunto_dados_visiveis,
                criado_em,
                atualizado_em
            )
            VALUES (
                10,
                1,
                'Família',
                'família',
                '["geral.fase_atual"]',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
            `
        )
        .run();

    banco.close();

    return {
        diretorio,
        caminho
    };
}

function criarApp(prisma, emails) {
    const permissionService = criarContactInvitationPermissionService({
        prisma
    });

    const tokenService = criarContactInvitationTokenService({
        crypto,
        baseUrl: 'aloya://support-network/invitation',
        now: () => new Date('2026-11-08T12:00:00.000Z')
    });

    const service = criarContactInvitationService({
        prisma,
        permissionService,
        tokenService,
        emailService: {
            async enviarConviteRedeApoio(dados) {
                emails.push(dados);
            }
        }
    });

    const controller = criarContactInvitationController({
        service,
        validator: criarContactInvitationValidator()
    });

    const app = express();

    app.use(express.json());

    app.use(
        '/support-network',
        criarContactInvitationRoutes({
            Router: express.Router,

            authMiddleware: {
                autenticar(req, _res, next) {
                    req.usuario = {
                        id: 1,
                        papel: 'principal'
                    };

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

            responseRateLimit(_req, _res, next) {
                next();
            },

            controller,

            responseController: {
                consultar(_req, res) {
                    res.status(501).end();
                },

                cadastrarContato(_req, res) {
                    res.status(501).end();
                },

                responder(_req, res) {
                    res.status(501).end();
                }
            }
        })
    );

    app.use(tratarErros);

    return app;
}

test('consulta conta e persiste convites pendentes com aparência', async () => {
    const { diretorio, caminho } = criarBanco();

    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({
            url: `file:${caminho.replaceAll('\\', '/')}`
        })
    });

    const emails = [];

    const servidor = criarApp(prisma, emails).listen(0, '127.0.0.1');

    try {
        await once(servidor, 'listening');

        const baseUrl = `http://127.0.0.1:` + `${servidor.address().port}` + '/support-network';

        const consultar = await fetch(`${baseUrl}/contact-invitations/lookup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'BIA@EXAMPLE.COM'
            })
        });

        assert.equal(consultar.status, 200);

        assert.deepEqual(await consultar.json(), {
            email: 'bia@example.com',
            contaContatoCadastrada: true
        });

        const aparenciaInvalida = await fetch(`${baseUrl}/contact-invitations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'invalida@example.com',
                categoriaId: 10,
                iconeId: 'desconhecido',
                corId: '#C85A44'
            })
        });

        assert.equal(aparenciaInvalida.status, 422);

        const erroAparencia = await aparenciaInvalida.json();

        assert.equal(erroAparencia.erro.codigo, 'ERRO_VALIDACAO');

        assert.equal(
            erroAparencia.erro.detalhes.some(({ campo }) => campo === 'iconeId'),
            true
        );

        assert.equal(
            erroAparencia.erro.detalhes.some(({ campo }) => campo === 'corId'),
            true
        );

        const porCategoria = await fetch(`${baseUrl}/contact-invitations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'bia@example.com',
                categoriaId: 10,
                iconeId: 'lotus',
                corId: 'verde'
            })
        });

        const corpoCategoria = await porCategoria.json();

        assert.equal(porCategoria.status, 201);

        assert.equal(corpoCategoria.mensagem, 'Convite enviado com sucesso.');

        assert.equal(corpoCategoria.convite.status, 'pendente');

        assert.equal(corpoCategoria.convite.iconeId, 'lotus');

        assert.equal(corpoCategoria.convite.corId, 'verde');

        assert.equal('tokenConviteHash' in corpoCategoria.convite, false);

        const individual = await fetch(`${baseUrl}/contact-invitations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'nova@example.com',
                permissoesIndividuais: ['geral.fase_atual', 'saude.consultas'],
                iconeId: 'coracao',
                corId: 'coral'
            })
        });

        const corpoIndividual = await individual.json();

        assert.equal(individual.status, 201);

        assert.equal(corpoIndividual.convite.iconeId, 'coracao');

        assert.equal(corpoIndividual.convite.corId, 'coral');

        const vinculos = await prisma.vinculoRedeApoio.findMany({
            orderBy: {
                id: 'asc'
            }
        });

        assert.equal(vinculos.length, 2);

        assert.equal(vinculos[0].status, 'pendente');

        assert.equal(vinculos[0].contatoId, 2);
        assert.equal(vinculos[0].categoriaId, 10);

        assert.deepEqual(vinculos[0].permissoesIndividuais, []);

        assert.equal(vinculos[0].iconeId, 'lotus');

        assert.equal(vinculos[0].corId, 'verde');

        assert.equal(vinculos[1].contatoId, null);
        assert.equal(vinculos[1].categoriaId, null);

        assert.deepEqual(vinculos[1].permissoesIndividuais, [
            'geral.fase_atual',
            'saude.consultas'
        ]);

        assert.equal(vinculos[1].iconeId, 'coracao');

        assert.equal(vinculos[1].corId, 'coral');

        assert.equal(emails.length, 2);

        assert.equal(emails[0].requerCadastro, false);

        assert.equal(emails[1].requerCadastro, true);
    } finally {
        servidor.close();

        await once(servidor, 'close');

        await prisma.$disconnect();

        rmSync(diretorio, {
            recursive: true,
            force: true
        });
    }
});
