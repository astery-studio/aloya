//Testa a integração HTTP completa do estado atual exibido na Home.
import assert from 'node:assert/strict';
import {once} from 'node:events';
import test from 'node:test';

import express from 'express';

import { criarCalendarModule } from '../../../../src/features/cycles/calendar/calendar.module.js';
import { criarCalendarRoutes } from '../../../../src/features/cycles/calendar/calendar.routes.js';
import { criarAuthMiddleware } from '../../../../src/shared/middleware/auth.middleware.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

function criarPrisma() {
    return {
        sessao: {
            async findFirst() {
                return {
                    id: 30,
                    usuario: {
                        id: 7,
                        papel: 'principal',
                        statusConta: 'ativa'
                    }
                };
            }
        },

        usuario: {
            async findUnique() {
                return {
                    duracaoCicloInformada: null,
                    duracaoMenstruacaoInformada: null,
                    duracaoLuteaInformada: 14,
                    _count: {
                        registrosCiclo: 2
                    },
                    registrosCiclo: [
                        {
                            id: 2,
                            dataInicio: new Date(
                                '2026-09-29T00:00:00.000Z'
                            ),
                            dataFim: new Date(
                                '2026-10-03T00:00:00.000Z'
                            )
                        },
                        {
                            id: 1,
                            dataInicio: new Date(
                                '2026-09-01T00:00:00.000Z'
                            ),
                            dataFim: new Date(
                                '2026-09-05T00:00:00.000Z'
                            )
                        }
                    ]
                };
            }
        },

        registroCiclo: {
            async findMany() {
                assert.fail(
                    'O endpoint atual não deve carregar a grade mensal.'
                );
            }
        }
    };
}

async function executarComApi(executar) {
    const prisma = criarPrisma();
    const calendarModule = criarCalendarModule({
        prisma,
        agora: () => new Date(
            '2026-10-10T15:00:00.000Z'
        )
    });
    const authMiddleware = criarAuthMiddleware({
        prisma,
        tokenService: {
            validarTokenSessao(token) {
                assert.equal(token, 'token-seguro');

                return {
                    usuarioId: 7
                };
            },

            gerarHashToken(token) {
                assert.equal(token, 'token-seguro');

                return 'hash-token-seguro';
            }
        }
    });
    const app = express();

    app.use(
        '/api/cycles',
        criarCalendarRoutes({
            Router: express.Router,
            authMiddleware,
            calendarController:
                calendarModule.calendarController
        })
    );

    app.use(tratarErros);

    const servidor = app.listen(
        0,
        '127.0.0.1'
    );

    try {
        await once(servidor, 'listening');

        const endereco = servidor.address();

        return await executar(
            `http://127.0.0.1:${endereco.port}/api/cycles/current`
        );
    } finally {
        await new Promise((resolve, reject) => {
            servidor.close((erro) => {
                if (erro) {
                    reject(erro);
                    return;
                }

                resolve();
            });
        });
    }
}

test('bloqueia acesso ao estado atual sem autenticação', async () => {
    await executarComApi(async (url) => {
        const resposta = await fetch(url);
        const corpo = await resposta.json();

        assert.equal(resposta.status, 401);
        assert.equal(
            corpo.erro.codigo,
            'NAO_AUTENTICADO'
        );
    });
});

test('retorna dia, fase e próxima menstruação da usuária autenticada', async () => {
    await executarComApi(async (url) => {
        const resposta = await fetch(
            url,
            {
                headers: {
                    Authorization: 'Bearer token-seguro'
                }
            }
        );
        const corpo = await resposta.json();

        assert.equal(resposta.status, 200);
        assert.equal(
            resposta.headers.get('cache-control'),
            'private, no-store'
        );
        assert.deepEqual(
            corpo,
            {
                estadoAtual: {
                    possuiCiclos: true,
                    dataReferencia: '2026-10-10',
                    diaDoCiclo: 12,
                    faseAtual: 'FOLICULAR',
                    estaNaJanelaFertil: true,
                    proximoInicioEstimado: '2026-10-27',
                    nivelConfianca: 'BAIXA',
                    statusPrevisao: 'DISPONIVEL'
                }
            }
        );
    });
});