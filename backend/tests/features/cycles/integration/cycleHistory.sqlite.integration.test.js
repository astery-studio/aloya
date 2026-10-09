//Testa o endpoint completo do histórico usando Express, Prisma e SQLite reais.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {once} from 'node:events';
import {DatabaseSync as Database} from 'node:sqlite';

import express from 'express';
import {PrismaBetterSqlite3} from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';

import {criarCycleHistoryRepository} from '../../../../src/features/cycles/cycleHistory.repository.js';
import {criarCycleHistoryService} from '../../../../src/features/cycles/cycleHistory.service.js';
import {criarCycleHistoryController} from '../../../../src/features/cycles/cycleHistory.controller.js';
import {criarCycleHistoryRoutes} from '../../../../src/features/cycles/cycleHistory.routes.js';
import {tratarErros} from '../../../../src/shared/middleware/error.middleware.js';

const {PrismaClient} = prismaPackage;

const CAMINHO_MIGRATION_INICIAL = fileURLToPath(new URL(
    '../../../../prisma/migrations/20260913221156_estrutura_inicial/migration.sql',
    import.meta.url
));

//Cria um banco isolado e aplica a estrutura inicial do projeto.
function criarBancoTemporario() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-historico-'));
    const caminhoBanco = join(diretorio, 'teste.db');
    const banco = new Database(caminhoBanco);

    banco.exec('PRAGMA foreign_keys = ON');
    banco.exec(readFileSync(CAMINHO_MIGRATION_INICIAL, 'utf8'));
    banco.close();

    return {
        diretorio,
        caminhoBanco
    };
}

//Cria o Prisma conectado exclusivamente ao banco temporário do teste.
function criarPrismaTemporario(caminhoBanco) {
    const url = `file:${caminhoBanco.replaceAll('\\', '/')}`;
    const adapter = new PrismaBetterSqlite3({url});

    return new PrismaClient({adapter});
}

//Insere duas contas e ciclos suficientes para verificar isolamento e paginação.
async function popularBanco(prisma) {
    await prisma.usuario.createMany({
        data: [
            {
                id: 1,
                nome: 'Ana',
                dataNascimento: new Date('2000-01-01T00:00:00.000Z'),
                email: 'ana.historico@example.com',
                senhaHash: 'hash-de-teste',
                papel: 'principal',
                statusConta: 'ativa'
            },
            {
                id: 2,
                nome: 'Beatriz',
                dataNascimento: new Date('1999-02-02T00:00:00.000Z'),
                email: 'beatriz.historico@example.com',
                senhaHash: 'hash-de-teste',
                papel: 'principal',
                statusConta: 'ativa'
            }
        ]
    });

    await prisma.registroCiclo.createMany({
        data: [
            {
                id: 1,
                usuarioId: 1,
                dataInicio: new Date('2026-07-08T00:00:00.000Z'),
                dataFim: new Date('2026-07-12T00:00:00.000Z'),
                duracaoMenstruacao: 5,
                duracaoCiclo: null,
                classificacao: 'normal',
                ehCicloInicial: true
            },
            {
                id: 2,
                usuarioId: 1,
                dataInicio: new Date('2026-08-07T00:00:00.000Z'),
                dataFim: new Date('2026-08-11T00:00:00.000Z'),
                duracaoMenstruacao: 5,
                duracaoCiclo: 30,
                classificacao: 'irregular',
                ehCicloInicial: false
            },
            {
                id: 3,
                usuarioId: 1,
                dataInicio: new Date('2026-09-04T00:00:00.000Z'),
                dataFim: null,
                duracaoMenstruacao: 4,
                duracaoCiclo: 28,
                classificacao: 'normal',
                ehCicloInicial: false
            },
            {
                id: 4,
                usuarioId: 2,
                dataInicio: new Date('2026-10-01T00:00:00.000Z'),
                dataFim: null,
                duracaoMenstruacao: 3,
                duracaoCiclo: 27,
                classificacao: 'atipico',
                ehCicloInicial: false
            }
        ]
    });
}

//Cria uma aplicação pequena contendo somente a rota que está sendo testada.
function criarAplicacao(prisma) {
    const repository = criarCycleHistoryRepository({prisma});
    const cycleHistoryService = criarCycleHistoryService({repository});
    const cycleHistoryController = criarCycleHistoryController({
        cycleHistoryService
    });

    const app = express();

    app.use(
        '/api/cycles',
        criarCycleHistoryRoutes({
            Router: express.Router,
            authMiddleware: {
                autenticar(req, res, next) {
                    if (req.headers.authorization !== 'Bearer token-de-teste') {
                        return res.status(401).json({
                            erro: {
                                codigo: 'NAO_AUTENTICADO',
                                mensagem: 'Autenticação necessária.'
                            }
                        });
                    }

                    req.usuario = {
                        id: 1,
                        papel: 'principal'
                    };

                    return next();
                }
            },
            cycleHistoryController
        })
    );

    app.use(tratarErros);

    return app;
}

//Fecha o servidor sem deixar conexões abertas após os testes.
async function fecharServidor(servidor) {
    await new Promise((resolve, reject) => {
        servidor.close(erro => {
            if (erro) {
                reject(erro);
                return;
            }

            resolve();
        });
    });
}

test('consulta o histórico real com autenticação, isolamento e paginação', async t => {
    const {diretorio, caminhoBanco} = criarBancoTemporario();
    const prisma = criarPrismaTemporario(caminhoBanco);
    const app = criarAplicacao(prisma);
    const servidor = app.listen(0, '127.0.0.1');

    try {
        await popularBanco(prisma);
        await once(servidor, 'listening');

        const endereco = servidor.address();
        const urlBase = `http://127.0.0.1:${endereco.port}/api/cycles/history`;

        await t.test('impede acesso sem autenticação', async () => {
            const resposta = await fetch(urlBase);
            const corpo = await resposta.json();

            assert.equal(resposta.status, 401);
            assert.deepEqual(corpo, {
                erro: {
                    codigo: 'NAO_AUTENTICADO',
                    mensagem: 'Autenticação necessária.'
                }
            });
        });

        await t.test('devolve a primeira página em ordem decrescente', async () => {
            const resposta = await fetch(`${urlBase}?limit=2`, {
                headers: {
                    Authorization: 'Bearer token-de-teste'
                }
            });

            const corpo = await resposta.json();

            assert.equal(resposta.status, 200);
            assert.equal(resposta.headers.get('cache-control'), 'no-store');
            assert.equal(corpo.quantidadeCiclos, 3);
            assert.equal(corpo.ciclos.length, 2);
            assert.deepEqual(corpo.ciclos.map(ciclo => ciclo.id), [3, 2]);
            assert.deepEqual(corpo.ciclos.map(ciclo => ciclo.numero), [3, 2]);
            assert.deepEqual(corpo.ciclos.map(ciclo => ciclo.dataInicio), [
                '2026-09-04',
                '2026-08-07'
            ]);
            assert.equal(corpo.ciclos[0].status, 'emAndamento');
            assert.equal(corpo.ciclos[1].estimativaIncerta, true);
            assert.equal(corpo.paginacao.temMais, true);
            assert.equal(typeof corpo.paginacao.proximoCursor, 'string');
            assert.equal(JSON.stringify(corpo).includes('beatriz'), false);
            assert.equal(JSON.stringify(corpo).includes('usuarioId'), false);
        });

        await t.test('continua a paginação sem repetir ou pular ciclos', async () => {
            const primeiraResposta = await fetch(`${urlBase}?limit=2`, {
                headers: {
                    Authorization: 'Bearer token-de-teste'
                }
            });

            const primeiraPagina = await primeiraResposta.json();
            const parametros = new URLSearchParams({
                limit: '2',
                cursor: primeiraPagina.paginacao.proximoCursor
            });

            const segundaResposta = await fetch(`${urlBase}?${parametros}`, {
                headers: {
                    Authorization: 'Bearer token-de-teste'
                }
            });

            const segundaPagina = await segundaResposta.json();

            assert.equal(segundaResposta.status, 200);
            assert.equal(segundaPagina.quantidadeCiclos, 3);
            assert.deepEqual(segundaPagina.ciclos.map(ciclo => ciclo.id), [1]);
            assert.deepEqual(segundaPagina.ciclos.map(ciclo => ciclo.numero), [1]);
            assert.equal(segundaPagina.ciclos[0].cicloInicial, true);
            assert.equal(segundaPagina.ciclos[0].duracaoDias, null);
            assert.equal(segundaPagina.paginacao.temMais, false);
            assert.equal(segundaPagina.paginacao.proximoCursor, null);

            const idsRecebidos = [
                ...primeiraPagina.ciclos.map(ciclo => ciclo.id),
                ...segundaPagina.ciclos.map(ciclo => ciclo.id)
            ];

            assert.deepEqual(idsRecebidos, [3, 2, 1]);
            assert.equal(idsRecebidos.includes(4), false);
        });

        await t.test('rejeita parâmetros desconhecidos sem consultar outra conta', async () => {
            const resposta = await fetch(`${urlBase}?usuarioId=2`, {
                headers: {
                    Authorization: 'Bearer token-de-teste'
                }
            });

            const corpo = await resposta.json();

            assert.equal(resposta.status, 400);
            assert.equal(corpo.erro.codigo, 'PARAMETRO_HISTORICO_DESCONHECIDO');
            assert.equal(corpo.erro.mensagem, 'O parâmetro "usuarioId" não é permitido.');
        });
    } finally {
        await fecharServidor(servidor);
        await prisma.$disconnect();

        rmSync(diretorio, {
            recursive: true,
            force: true
        });
    }
});