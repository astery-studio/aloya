import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { DatabaseSync as Database } from 'node:sqlite';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import express from 'express';

import { criarCycleEditController } from '../../../../src/features/cycles/controllers/cycleEdit.controller.js';
import { criarCycleEditRoutes } from '../../../../src/features/cycles/routes/cycleEdit.routes.js';
import { criarCycleEditService } from '../../../../src/features/cycles/services/cycleEdit.service.js';
import { criarCycleEditValidator } from '../../../../src/features/cycles/validators/cycleEdit.validator.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const { PrismaClient } = prismaPackage;
const MIGRATION = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20260913221156_estrutura_inicial/migration.sql',
        import.meta.url
    )
);

function criarBancoTemporario() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-edicao-ciclo-'));
    const caminho = join(diretorio, 'teste.db');
    const banco = new Database(caminho);
    banco.exec('PRAGMA foreign_keys = ON');
    banco.exec(readFileSync(MIGRATION, 'utf8'));
    banco.close();
    return { diretorio, caminho };
}

function criarPrisma(caminho) {
    const url = `file:${caminho.replaceAll('\\', '/')}`;
    return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

async function popular(prisma) {
    await prisma.usuario.createMany({
        data: [
            {
                id: 1,
                nome: 'Ana',
                dataNascimento: new Date('2000-01-01T00:00:00.000Z'),
                email: 'ana.edicao@example.com',
                senhaHash: 'hash',
                papel: 'principal',
                statusConta: 'ativa'
            },
            {
                id: 2,
                nome: 'Bia',
                dataNascimento: new Date('2000-01-01T00:00:00.000Z'),
                email: 'bia.edicao@example.com',
                senhaHash: 'hash',
                papel: 'principal',
                statusConta: 'ativa'
            }
        ]
    });

    const ciclos = [
        [1, 1, '2026-07-08', '2026-07-12', null, true],
        [2, 1, '2026-08-07', '2026-08-11', 30, false],
        [3, 1, '2026-09-04', '2026-09-08', 28, false],
        [4, 2, '2026-08-01', '2026-08-04', null, true]
    ];

    for (const [id, usuarioId, inicio, fim, duracaoCiclo, inicial] of ciclos) {
        const dataInicio = new Date(`${inicio}T00:00:00.000Z`);
        const dataFim = new Date(`${fim}T00:00:00.000Z`);
        await prisma.registroCiclo.create({
            data: {
                id,
                usuarioId,
                dataInicio,
                dataFim,
                duracaoMenstruacao: 5,
                duracaoCiclo,
                ehCicloInicial: inicial,
                diasMenstruacao: {
                    create: Array.from({ length: 5 }, (_, indice) => ({
                        data: new Date(dataInicio.getTime() + indice * 86_400_000)
                    }))
                }
            }
        });
    }

    await prisma.previsao.create({
        data: {
            usuarioId: 1,
            registroCicloBaseId: 3,
            duracaoCicloPrevista: 28,
            duracaoLuteaUsada: 14,
            duracaoMenstruacaoUsada: 5,
            fimFaseMenstrual: new Date('2026-09-08T00:00:00.000Z'),
            inicioFaseFolicular: new Date('2026-09-09T00:00:00.000Z'),
            fimFaseFolicular: new Date('2026-09-16T00:00:00.000Z'),
            dataEstimadaOvulacao: new Date('2026-09-17T00:00:00.000Z'),
            inicioFaseLutea: new Date('2026-09-18T00:00:00.000Z'),
            dataFimCicloPrevisto: new Date('2026-10-01T00:00:00.000Z'),
            inicioJanelaFertil: new Date('2026-09-12T00:00:00.000Z'),
            fimJanelaFertil: new Date('2026-09-18T00:00:00.000Z'),
            nivelConfianca: 'media'
        }
    });
}

function criarAplicacao(prisma) {
    const service = criarCycleEditService({ prisma });
    const validator = criarCycleEditValidator({
        agora: () => new Date('2026-10-29T12:00:00.000Z')
    });
    const controller = criarCycleEditController({ service, validator });
    const app = express();
    app.use(express.json());
    app.use(
        '/api/cycles',
        criarCycleEditRoutes({
            Router: express.Router,
            authMiddleware: {
                autenticar(req, res, next) {
                    if (req.headers.authorization !== 'Bearer token') {
                        return res.status(401).json({ erro: { codigo: 'NAO_AUTENTICADO' } });
                    }
                    req.usuario = { id: 1 };
                    return next();
                }
            },
            controller
        })
    );
    app.use(tratarErros);
    return app;
}

async function requisitar(url, id, body) {
    const resposta = await fetch(`${url}/${id}`, {
        method: 'PATCH',
        headers: { authorization: 'Bearer token', 'content-type': 'application/json' },
        body: JSON.stringify(body)
    });
    return { resposta, corpo: await resposta.json() };
}

test('edita o ciclo de forma atômica e recalcula dados derivados', async (t) => {
    const { diretorio, caminho } = criarBancoTemporario();
    const prisma = criarPrisma(caminho);
    const servidor = criarAplicacao(prisma).listen(0, '127.0.0.1');

    try {
        await once(servidor, 'listening');
        await popular(prisma);
        const url = `http://127.0.0.1:${servidor.address().port}/api/cycles`;

        await t.test('carrega o ciclo selecionado no calendário', async () => {
            const resposta = await fetch(`${url}/2`, {
                headers: { authorization: 'Bearer token' }
            });
            const corpo = await resposta.json();

            assert.equal(resposta.status, 200);
            assert.deepEqual(corpo.ciclo, {
                id: 2,
                dataInicio: '2026-08-07',
                dataFim: '2026-08-11',
                duracaoMenstruacao: 5,
                duracaoCiclo: 30
            });
        });

        await t.test('reverte toda a edição quando uma operação intermediária falha', async () => {
            const antes = await prisma.registroCiclo.findUnique({
                where: { id: 2 },
                include: { diasMenstruacao: true }
            });

            await prisma.$executeRawUnsafe(`
                CREATE TRIGGER falhar_dias_ciclo
                BEFORE INSERT ON dias_menstruacao
                WHEN NEW.registro_ciclo_id = 2
                BEGIN
                    SELECT RAISE(ABORT, 'falha simulada');
                END
            `);

            const { resposta, corpo } = await requisitar(url, 2, { dataFim: '2026-08-10' });
            await prisma.$executeRawUnsafe('DROP TRIGGER falhar_dias_ciclo');

            const depois = await prisma.registroCiclo.findUnique({
                where: { id: 2 },
                include: { diasMenstruacao: true }
            });

            assert.equal(resposta.status, 500);
            assert.equal(corpo.erro.codigo, 'ERRO_INTERNO');
            assert.equal(depois.dataInicio.getTime(), antes.dataInicio.getTime());
            assert.equal(depois.dataFim.getTime(), antes.dataFim.getTime());
            assert.equal(depois.diasMenstruacao.length, antes.diasMenstruacao.length);
        });

        await t.test('atualiza datas, dias, durações e invalida a previsão', async () => {
            const { resposta, corpo } = await requisitar(url, 2, {
                dataInicio: '2026-08-06',
                dataFim: '2026-08-10'
            });

            assert.equal(resposta.status, 200);
            assert.equal(corpo.mensagem, 'Registro de menstruação atualizado com sucesso.');
            assert.deepEqual(corpo.ciclo, {
                id: 2,
                dataInicio: '2026-08-06',
                dataFim: '2026-08-10',
                duracaoMenstruacao: 5,
                duracaoCiclo: 29
            });

            const registros = await prisma.registroCiclo.findMany({
                where: { usuarioId: 1 },
                orderBy: { dataInicio: 'asc' },
                include: { diasMenstruacao: { orderBy: { data: 'asc' } } }
            });
            assert.deepEqual(
                registros.map((ciclo) => ciclo.duracaoCiclo),
                [null, 29, 29]
            );
            assert.deepEqual(
                registros[1].diasMenstruacao.map((dia) => dia.data.toISOString().slice(0, 10)),
                ['2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10']
            );
            assert.equal(await prisma.previsao.count({ where: { usuarioId: 1 } }), 0);
        });

        await t.test('informa o período conflitante e preserva o registro', async () => {
            const antes = await prisma.registroCiclo.findUnique({ where: { id: 2 } });
            const { resposta, corpo } = await requisitar(url, 2, {
                dataInicio: '2026-09-03',
                dataFim: '2026-09-05'
            });
            const depois = await prisma.registroCiclo.findUnique({ where: { id: 2 } });

            assert.equal(resposta.status, 409);
            assert.equal(corpo.erro.codigo, 'SOBREPOSICAO_CICLO');
            assert.match(corpo.erro.mensagem, /2026-09-04 a 2026-09-08/);
            assert.equal(depois.dataInicio.getTime(), antes.dataInicio.getTime());
            assert.equal(depois.dataFim.getTime(), antes.dataFim.getTime());
        });

        await t.test('não revela ciclos pertencentes a outra conta', async () => {
            const inexistente = await requisitar(url, 999, { dataFim: '2026-08-03' });
            const alheio = await requisitar(url, 4, { dataFim: '2026-08-03' });

            assert.equal(inexistente.resposta.status, 404);
            assert.equal(alheio.resposta.status, 404);
            assert.deepEqual(alheio.corpo, inexistente.corpo);
        });
    } finally {
        await new Promise((resolve, reject) =>
            servidor.close((falha) => (falha ? reject(falha) : resolve()))
        );
        await prisma.$disconnect();
        rmSync(diretorio, { recursive: true, force: true });
    }
});
