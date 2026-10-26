import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { DatabaseSync as Database } from 'node:sqlite';

import express from 'express';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';

import { criarPermissionCategoryRoutes } from '../../../../src/features/support-network/routes/permissionCategory.routes.js';
import { criarPermissionCategoryController } from '../../../../src/features/support-network/controllers/permissionCategory.controller.js';
import { criarPermissionCategoryService } from '../../../../src/features/support-network/services/permissionCategory.service.js';
import { criarPermissionCategoryValidator } from '../../../../src/features/support-network/validators/permissionCategory.validator.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const { PrismaClient } = prismaPackage;

const CAMINHO_MIGRATION_INICIAL = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20260913221156_estrutura_inicial/migration.sql',
        import.meta.url
    )
);

const CAMINHO_MIGRATION_NORMALIZACAO = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20260925015114_normalizar_nome_categoria_permissao/migration.sql',
        import.meta.url
    )
);

function criarBancoTemporario() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-categorias-'));
    const caminhoBanco = join(diretorio, 'teste.db');
    const banco = new Database(caminhoBanco);

    banco.exec('PRAGMA foreign_keys = ON');

    const migrationInicial = readFileSync(CAMINHO_MIGRATION_INICIAL, 'utf8');

    banco.exec(migrationInicial);

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
        VALUES (
            1,
            'Ana',
            '2000-01-01T00:00:00.000Z',
            'ana@example.com',
            'hash-de-teste',
            'principal',
            'ativa',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
    `
        )
        .run();

    return {
        banco,
        caminhoBanco,
        diretorio
    };
}

function inserirCategoriaExistente(banco) {
    banco
        .prepare(
            `
        INSERT INTO categorias_permissao (
            id,
            titular_id,
            nome,
            conjunto_dados_visiveis,
            criado_em,
            atualizado_em
        )
        VALUES (
            10,
            1,
            'Família Próxima',
            '["geral.fase_atual"]',
            '2026-09-20T10:00:00.000Z',
            '2026-09-21T11:00:00.000Z'
        )
    `
        )
        .run();

    banco
        .prepare(
            `
        INSERT INTO vinculos_rede_apoio (
            id,
            titular_id,
            email_convidado,
            categoria_id,
            atualizado_em
        )
        VALUES (
            20,
            1,
            'contato@example.com',
            10,
            CURRENT_TIMESTAMP
        )
    `
        )
        .run();
}

function executarMigrationNormalizacao(banco) {
    const migration = readFileSync(CAMINHO_MIGRATION_NORMALIZACAO, 'utf8');

    banco.exec(migration);
}

function removerBancoTemporario(banco, diretorio) {
    banco.close();

    rmSync(diretorio, {
        recursive: true,
        force: true
    });
}

test('preserva categorias e vínculos existentes ao normalizar os nomes', () => {
    const { banco, diretorio } = criarBancoTemporario();

    try {
        inserirCategoriaExistente(banco);
        executarMigrationNormalizacao(banco);

        const categoria = banco
            .prepare(
                `
                SELECT
                    id,
                    titular_id AS titularId,
                    nome,
                    nome_normalizado AS nomeNormalizado,
                    conjunto_dados_visiveis AS dadosVisiveis,
                    criado_em AS criadoEm,
                    atualizado_em AS atualizadoEm
                FROM categorias_permissao
                WHERE id = 10
            `
            )
            .get();

        assert.deepEqual(
            { ...categoria },
            {
                id: 10,
                titularId: 1,
                nome: 'Família Próxima',
                nomeNormalizado: 'família próxima',
                dadosVisiveis: '["geral.fase_atual"]',
                criadoEm: '2026-09-20T10:00:00.000Z',
                atualizadoEm: '2026-09-21T11:00:00.000Z'
            }
        );

        const vinculo = banco
            .prepare(
                `
                SELECT
                    id,
                    categoria_id AS categoriaId,
                    titular_id AS titularId
                FROM vinculos_rede_apoio
                WHERE id = 20
            `
            )
            .get();

        assert.deepEqual(
            { ...vinculo },
            {
                id: 20,
                categoriaId: 10,
                titularId: 1
            }
        );

        const problemasDeIntegridade = banco.prepare('PRAGMA foreign_key_check').all();

        assert.deepEqual(problemasDeIntegridade, []);
    } finally {
        removerBancoTemporario(banco, diretorio);
    }
});

test('cria uma categoria pelo endpoint usando SQLite real', async () => {
    const { banco, caminhoBanco, diretorio } = criarBancoTemporario();

    executarMigrationNormalizacao(banco);
    banco.close();

    const urlBanco = `file:${caminhoBanco.replaceAll('\\', '/')}`;

    const adapter = new PrismaBetterSqlite3({
        url: urlBanco
    });

    const prisma = new PrismaClient({
        adapter
    });

    const permissionCategoryService = criarPermissionCategoryService({
        prisma
    });

    const permissionCategoryValidator = criarPermissionCategoryValidator();

    const permissionCategoryController = criarPermissionCategoryController({
        permissionCategoryService,
        permissionCategoryValidator
    });

    const app = express();

    app.use(express.json());

    app.use(
        '/support-network',
        criarPermissionCategoryRoutes({
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
            permissionCategoryRateLimit(_req, _res, next) {
                next();
            },
            permissionCategoryController
        })
    );

    app.use(tratarErros);

    const servidor = app.listen(0, '127.0.0.1');

    try {
        await once(servidor, 'listening');

        const endereco = servidor.address();

        const resposta = await fetch(
            `http://127.0.0.1:${endereco.port}/support-network/permission-categories`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: 'Profissionais de saúde',
                    dadosVisiveis: ['geral.fase_atual', 'saude.consultas']
                })
            }
        );

        const corpo = await resposta.json();

        assert.equal(resposta.status, 201);
        assert.equal(corpo.mensagem, 'Categoria criada com sucesso.');
        assert.equal(corpo.categoria.nome, 'Profissionais de saúde');
        assert.deepEqual(corpo.categoria.dadosVisiveis, ['geral.fase_atual', 'saude.consultas']);

        const categoriaPersistida = await prisma.categoriaPermissao.findUnique({
            where: {
                titularId_nomeNormalizado: {
                    titularId: 1,
                    nomeNormalizado: 'profissionais de saúde'
                }
            }
        });

        assert.ok(categoriaPersistida);
        assert.equal(categoriaPersistida.nome, 'Profissionais de saúde');
    } finally {
        await prisma.$disconnect();

        await new Promise((resolve, reject) => {
            servidor.close((erro) => {
                if (erro) {
                    reject(erro);
                    return;
                }

                resolve();
            });
        });

        rmSync(diretorio, {
            recursive: true,
            force: true
        });
    }
});

test('lista categorias da titular em ordem alfabética e conta somente vínculos ativos', async () => {
    const { banco, caminhoBanco, diretorio } = criarBancoTemporario();

    executarMigrationNormalizacao(banco);

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
            VALUES (
                2,
                'Beatriz',
                '1998-06-20T00:00:00.000Z',
                'beatriz@example.com',
                'hash-de-teste',
                'principal',
                'ativa',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
        `
        )
        .run();

    const inserirCategoria = banco.prepare(`
            INSERT INTO categorias_permissao (
                id,
                titular_id,
                nome,
                nome_normalizado,
                conjunto_dados_visiveis,
                atualizado_em
            )
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

    inserirCategoria.run(10, 1, 'Saúde', 'saúde', '["saude.consultas"]');
    inserirCategoria.run(
        11,
        1,
        'Família 10',
        'família 10',
        '["geral.fase_atual","emocional.sintomas_emocionais"]'
    );
    inserirCategoria.run(12, 1, 'Família 2', 'família 2', '["geral.fase_atual"]');
    inserirCategoria.run(20, 2, 'Categoria privada', 'categoria privada', '["geral.fase_atual"]');

    const inserirVinculo = banco.prepare(`
            INSERT INTO vinculos_rede_apoio (
                id,
                titular_id,
                email_convidado,
                categoria_id,
                status,
                atualizado_em
            )
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

    inserirVinculo.run(101, 1, 'ativo1@example.com', 10, 'ativo');
    inserirVinculo.run(102, 1, 'ativo2@example.com', 10, 'ativo');
    inserirVinculo.run(103, 1, 'pendente@example.com', 10, 'pendente');
    inserirVinculo.run(104, 1, 'revogado@example.com', 10, 'revogado');
    inserirVinculo.run(105, 1, 'familia10@example.com', 11, 'ativo');
    inserirVinculo.run(201, 2, 'privado@example.com', 20, 'ativo');

    banco.close();

    const urlBanco = `file:${caminhoBanco.replaceAll('\\', '/')}`;
    const adapter = new PrismaBetterSqlite3({ url: urlBanco });
    const prisma = new PrismaClient({ adapter });
    const permissionCategoryService = criarPermissionCategoryService({ prisma });
    const permissionCategoryController = criarPermissionCategoryController({
        permissionCategoryService,
        permissionCategoryValidator: criarPermissionCategoryValidator()
    });
    const app = express();

    app.use(express.json());
    app.use(
        '/support-network',
        criarPermissionCategoryRoutes({
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
            permissionCategoryRateLimit(_req, _res, next) {
                next();
            },
            permissionCategoryController
        })
    );
    app.use(tratarErros);

    const servidor = app.listen(0, '127.0.0.1');

    try {
        await once(servidor, 'listening');

        const endereco = servidor.address();
        const resposta = await fetch(
            `http://127.0.0.1:${endereco.port}/support-network/permission-categories`
        );
        const corpo = await resposta.json();

        assert.equal(resposta.status, 200);
        assert.equal(resposta.headers.get('cache-control'), 'private, no-store');
        assert.deepEqual(
            corpo.categorias.map((categoria) => ({
                id: categoria.id,
                nome: categoria.nome,
                dadosVisiveis: categoria.dadosVisiveis,
                quantidadeContatos: categoria.quantidadeContatos
            })),
            [
                {
                    id: 12,
                    nome: 'Família 2',
                    dadosVisiveis: ['geral.fase_atual'],
                    quantidadeContatos: 0
                },
                {
                    id: 11,
                    nome: 'Família 10',
                    dadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
                    quantidadeContatos: 1
                },
                {
                    id: 10,
                    nome: 'Saúde',
                    dadosVisiveis: ['saude.consultas'],
                    quantidadeContatos: 2
                }
            ]
        );
        assert.equal(
            corpo.categorias.some((categoria) => categoria.id === 20),
            false
        );
        assert.equal('titularId' in corpo.categorias[0], false);
        assert.equal('nomeNormalizado' in corpo.categorias[0], false);
    } finally {
        await prisma.$disconnect();

        await new Promise((resolve, reject) => {
            servidor.close((erro) => {
                if (erro) {
                    reject(erro);
                    return;
                }

                resolve();
            });
        });

        rmSync(diretorio, {
            recursive: true,
            force: true
        });
    }
});

test('atualiza categoria sem contatos ativos pelo endpoint e preserva vínculos', async () => {
    const { banco, caminhoBanco, diretorio } = criarBancoTemporario();

    executarMigrationNormalizacao(banco);
    banco.close();

    const urlBanco = `file:${caminhoBanco.replaceAll('\\', '/')}`;
    const adapter = new PrismaBetterSqlite3({ url: urlBanco });
    const prisma = new PrismaClient({ adapter });
    const categoriaPreparada = await prisma.categoriaPermissao.create({
        data: {
            titularId: 1,
            nome: 'Família Próxima',
            nomeNormalizado: 'família próxima',
            conjuntoDadosVisiveis: ['geral.fase_atual']
        }
    });
    const vinculoPreparado = await prisma.vinculoRedeApoio.create({
        data: {
            titularId: 1,
            emailConvidado: 'contato@example.com',
            categoriaId: categoriaPreparada.id,
            status: 'pendente'
        }
    });
    const permissionCategoryService = criarPermissionCategoryService({ prisma });
    const permissionCategoryController = criarPermissionCategoryController({
        permissionCategoryService,
        permissionCategoryValidator: criarPermissionCategoryValidator()
    });
    const app = express();

    app.use(express.json());
    app.use(
        '/support-network',
        criarPermissionCategoryRoutes({
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
            permissionCategoryRateLimit(_req, _res, next) {
                next();
            },
            permissionCategoryUpdateRateLimit(_req, _res, next) {
                next();
            },
            permissionCategoryController
        })
    );
    app.use(tratarErros);

    const servidor = app.listen(0, '127.0.0.1');

    try {
        await once(servidor, 'listening');
        const endereco = servidor.address();
        const resposta = await fetch(
            `http://127.0.0.1:${endereco.port}/support-network/permission-categories/${categoriaPreparada.id}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: 'Namorado',
                    dadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
                    atualizadoEm: categoriaPreparada.atualizadoEm.toISOString()
                })
            }
        );
        const corpo = await resposta.json();

        assert.equal(resposta.status, 200, JSON.stringify(corpo));
        assert.equal(corpo.mensagem, 'Categoria atualizada com sucesso.');
        assert.equal(corpo.categoria.nome, 'Namorado');
        assert.equal(corpo.categoria.quantidadeContatos, 0);
        assert.deepEqual(corpo.categoria.dadosVisiveis, [
            'geral.fase_atual',
            'emocional.sintomas_emocionais'
        ]);

        const categoria = await prisma.categoriaPermissao.findUnique({
            where: { id: categoriaPreparada.id }
        });
        const vinculo = await prisma.vinculoRedeApoio.findUnique({
            where: { id: vinculoPreparado.id }
        });

        assert.equal(categoria.nome, 'Namorado');
        assert.equal(categoria.nomeNormalizado, 'namorado');
        assert.equal(vinculo.categoriaId, categoriaPreparada.id);
        assert.equal(vinculo.status, 'pendente');
    } finally {
        await prisma.$disconnect();
        await new Promise((resolve, reject) => {
            servidor.close((erro) => (erro ? reject(erro) : resolve()));
        });
        rmSync(diretorio, { recursive: true, force: true });
    }
});

test('exige confirmação e propaga a atualização para vínculo ativo', async () => {
    const { banco, caminhoBanco, diretorio } = criarBancoTemporario();

    executarMigrationNormalizacao(banco);
    banco.close();

    const urlBanco = `file:${caminhoBanco.replaceAll('\\', '/')}`;
    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: urlBanco })
    });
    const categoriaPreparada = await prisma.categoriaPermissao.create({
        data: {
            titularId: 1,
            nome: 'Parceiro(a)',
            nomeNormalizado: 'parceiro(a)',
            conjuntoDadosVisiveis: ['geral.fase_atual']
        }
    });
    const vinculoPreparado = await prisma.vinculoRedeApoio.create({
        data: {
            titularId: 1,
            emailConvidado: 'ativo@example.com',
            categoriaId: categoriaPreparada.id,
            status: 'ativo'
        }
    });
    const permissionCategoryController = criarPermissionCategoryController({
        permissionCategoryService: criarPermissionCategoryService({ prisma }),
        permissionCategoryValidator: criarPermissionCategoryValidator()
    });
    const app = express();

    app.use(express.json());
    app.use(
        '/support-network',
        criarPermissionCategoryRoutes({
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
            permissionCategoryRateLimit(_req, _res, next) {
                next();
            },
            permissionCategoryUpdateRateLimit(_req, _res, next) {
                next();
            },
            permissionCategoryController
        })
    );
    app.use(tratarErros);

    const servidor = app.listen(0, '127.0.0.1');

    try {
        await once(servidor, 'listening');
        const endereco = servidor.address();
        const url = `http://127.0.0.1:${endereco.port}/support-network/permission-categories/${categoriaPreparada.id}`;
        const dados = {
            nome: 'Namorado',
            dadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
            atualizadoEm: categoriaPreparada.atualizadoEm.toISOString()
        };
        const primeiraResposta = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        const primeiroCorpo = await primeiraResposta.json();

        assert.equal(primeiraResposta.status, 409);
        assert.equal(primeiroCorpo.erro.codigo, 'CONFIRMACAO_IMPACTO_NECESSARIA');
        assert.equal(primeiroCorpo.erro.detalhes.quantidadeContatos, 1);

        const categoriaAntesDaConfirmacao = await prisma.categoriaPermissao.findUnique({
            where: { id: categoriaPreparada.id }
        });
        assert.equal(categoriaAntesDaConfirmacao.nome, 'Parceiro(a)');

        const respostaConfirmada = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...dados, quantidadeContatosConfirmada: 1 })
        });
        const corpoConfirmado = await respostaConfirmada.json();

        assert.equal(respostaConfirmada.status, 200, JSON.stringify(corpoConfirmado));
        assert.equal(corpoConfirmado.categoria.nome, 'Namorado');
        assert.equal(corpoConfirmado.categoria.quantidadeContatos, 1);

        const vinculoDepois = await prisma.vinculoRedeApoio.findUnique({
            where: { id: vinculoPreparado.id },
            include: { categoria: true }
        });
        assert.equal(vinculoDepois.status, 'ativo');
        assert.equal(vinculoDepois.categoria.nome, 'Namorado');
        assert.deepEqual(vinculoDepois.categoria.conjuntoDadosVisiveis, [
            'geral.fase_atual',
            'emocional.sintomas_emocionais'
        ]);
    } finally {
        await prisma.$disconnect();
        await new Promise((resolve, reject) => {
            servidor.close((erro) => (erro ? reject(erro) : resolve()));
        });
        rmSync(diretorio, { recursive: true, force: true });
    }
});
