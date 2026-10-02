//Testa autenticação, autorização, remoção lógica, histórico e resposta HTTP da HU-022.
import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';

import { criarContraceptiveController } from '../../../../src/features/contraceptives/contraceptive.controller.js';
import { criarRotasAnticoncepcionais } from '../../../../src/features/contraceptives/contraceptive.routes.js';
import { criarContraceptiveService } from '../../../../src/features/contraceptives/contraceptive.service.js';
import { criarAuthMiddleware } from '../../../../src/shared/middleware/auth.middleware.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const agora = new Date('2026-10-02T18:00:00.000Z');
const atualizadoEm = new Date('2026-10-02T12:00:00.000Z');

const autorizacao = {
    authorization: 'Bearer token-seguro'
};

//Cria um banco falso com anticoncepcional, histórico e notificações persistidos em memória.
function criarBanco({usuarioDono = 7, existe = true} = {}) {
    const estado = {
        anticoncepcional: {
            id: 1,
            usuarioId: usuarioDono,
            nome: 'Mercilon',
            tipo: 'pilula',
            horariosProgramados: ['08:00'],
            frequencia: 'uso_continuo',
            dataInicioUso: new Date('2026-09-01T00:00:00.000Z'),
            periodosPausa: [],
            dataValidade: null,
            nivelIntensidadeAlerta: 'critico',
            ativo: true,
            removidoEm: null,
            criadoEm: new Date('2026-09-01T12:00:00.000Z'),
            atualizadoEm
        },

        usos: [
            {
                id: 10,
                anticoncepcionalId: 1,
                statusUso: 'confirmado',
                horarioRealConfirmacao: new Date('2026-10-01T08:02:00.000Z')
            }
        ],

        notificacoes: [
            {
                id: 20,
                usuarioId: usuarioDono,
                tipoOrigem: 'anticoncepcional',
                origemId: 1,
                statusEnvio: 'agendada'
            },
            {
                id: 21,
                usuarioId: usuarioDono,
                tipoOrigem: 'anticoncepcional',
                origemId: 1,
                statusEnvio: 'enviada'
            }
        ]
    };

    const banco = {
        estado,

        sessao: {
            async findFirst() {
                return {
                    id: 3,
                    usuario: {
                        id: 7,
                        papel: 'principal',
                        statusConta: 'ativa'
                    }
                };
            }
        },

        anticoncepcional: {
            async findFirst({where}) {
                const registro = estado.anticoncepcional;

                const corresponde = existe
                    && where.id === registro.id
                    && where.usuarioId === registro.usuarioId
                    && where.ativo === registro.ativo;

                if (!corresponde) return null;

                return {
                    id: registro.id,
                    atualizadoEm: registro.atualizadoEm
                };
            },

            async updateMany({where, data}) {
                const registro = estado.anticoncepcional;

                const corresponde = existe
                    && where.id === registro.id
                    && where.usuarioId === registro.usuarioId
                    && where.ativo === registro.ativo
                    && where.atualizadoEm?.getTime() === registro.atualizadoEm.getTime();

                if (!corresponde) return {count: 0};

                estado.anticoncepcional = {
                    ...registro,
                    ...data,
                    atualizadoEm: agora
                };

                return {count: 1};
            },

            async findMany({where}) {
                const registro = estado.anticoncepcional;

                if (!existe) return [];
                if (where.usuarioId !== registro.usuarioId) return [];
                if (where.ativo !== registro.ativo) return [];

                return [
                    {
                        ...registro
                    }
                ];
            }
        },

        notificacao: {
            async updateMany({where, data}) {
                let quantidade = 0;

                estado.notificacoes = estado.notificacoes.map((notificacao) => {
                    const corresponde = notificacao.usuarioId === where.usuarioId
                        && notificacao.tipoOrigem === where.tipoOrigem
                        && notificacao.origemId === where.origemId
                        && notificacao.statusEnvio === where.statusEnvio;

                    if (!corresponde) return notificacao;

                    quantidade += 1;

                    return {
                        ...notificacao,
                        ...data
                    };
                });

                return {
                    count: quantidade
                };
            }
        },

        async $transaction(operacao) {
            return operacao(banco);
        }
    };

    return banco;
}

//Monta uma API real em uma porta temporária.
async function comApi(banco, executar) {
    const app = express();
    const service = criarContraceptiveService(banco, () => agora);
    const controller = criarContraceptiveController(service);

    const authMiddleware = criarAuthMiddleware({
        prisma: banco,
        tokenService: {
            validarTokenSessao: () => ({
                usuarioId: 7
            }),
            gerarHashToken: () => 'hash-seguro'
        }
    });

    app.use(express.json());

    app.use('/api/anticoncepcionais', criarRotasAnticoncepcionais({
        autenticar: authMiddleware.autenticar,
        controller,
        edicaoRateLimit: (_requisicao, _resposta, proximo) => proximo(),
        remocaoRateLimit: (_requisicao, _resposta, proximo) => proximo()
    }));

    app.use(tratarErros);

    const servidor = app.listen(0);
    await new Promise((resolve) => servidor.once('listening', resolve));

    try {
        const {port} = servidor.address();

        return await executar(
            `http://127.0.0.1:${port}/api/anticoncepcionais`
        );
    } finally {
        await new Promise((resolve) => servidor.close(resolve));
    }
}

test('remove, cancela reenvios e retira imediatamente o item da listagem', async () => {
    const banco = criarBanco();

    await comApi(banco, async (url) => {
        const respostaRemocao = await fetch(`${url}/1`, {
            method: 'DELETE',
            headers: autorizacao
        });

        const corpoRemocao = await respostaRemocao.json();

        assert.equal(respostaRemocao.status, 200);

        assert.deepEqual(corpoRemocao, {
            mensagem: 'Anticoncepcional removido com sucesso.'
        });

        assert.equal(banco.estado.anticoncepcional.ativo, false);
        assert.equal(
            banco.estado.anticoncepcional.removidoEm.toISOString(),
            agora.toISOString()
        );

        const respostaListagem = await fetch(url, {
            headers: autorizacao
        });

        const corpoListagem = await respostaListagem.json();

        assert.equal(respostaListagem.status, 200);
        assert.deepEqual(corpoListagem.anticoncepcionais, []);
    });
});

test('preserva usos confirmados e notificações já enviadas', async () => {
    const banco = criarBanco();

    await comApi(banco, async (url) => {
        await fetch(`${url}/1`, {
            method: 'DELETE',
            headers: autorizacao
        });

        assert.equal(banco.estado.usos.length, 1);
        assert.equal(banco.estado.usos[0].statusUso, 'confirmado');

        assert.deepEqual(
            banco.estado.notificacoes.map((notificacao) => ({
                id: notificacao.id,
                statusEnvio: notificacao.statusEnvio
            })),
            [
                {
                    id: 20,
                    statusEnvio: 'cancelada'
                },
                {
                    id: 21,
                    statusEnvio: 'enviada'
                }
            ]
        );
    });
});

test('exige autenticação antes de remover qualquer dado', async () => {
    const banco = criarBanco();

    await comApi(banco, async (url) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'DELETE'
        });

        assert.equal(resposta.status, 401);
        assert.equal(banco.estado.anticoncepcional.ativo, true);
        assert.equal(banco.estado.anticoncepcional.removidoEm, null);
        assert.equal(banco.estado.notificacoes[0].statusEnvio, 'agendada');
    });
});

test('não permite remover anticoncepcional de outra usuária', async () => {
    const banco = criarBanco({
        usuarioDono: 8
    });

    await comApi(banco, async (url) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'DELETE',
            headers: autorizacao
        });

        const corpo = await resposta.json();

        assert.equal(resposta.status, 404);
        assert.equal(corpo.erro.codigo, 'ANTICONCEPCIONAL_NAO_ENCONTRADO');
        assert.equal(banco.estado.anticoncepcional.ativo, true);
    });
});

test('não diferencia item inexistente de item pertencente a outra usuária', async () => {
    const respostas = [];

    await comApi(criarBanco({
        existe: false
    }), async (url) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'DELETE',
            headers: autorizacao
        });

        respostas.push({
            status: resposta.status,
            corpo: await resposta.json()
        });
    });

    await comApi(criarBanco({
        usuarioDono: 8
    }), async (url) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'DELETE',
            headers: autorizacao
        });

        respostas.push({
            status: resposta.status,
            corpo: await resposta.json()
        });
    });

    assert.deepEqual(respostas[0], respostas[1]);
});

test('rejeita identificador manipulado antes de alterar o banco', async () => {
    const banco = criarBanco();

    await comApi(banco, async (url) => {
        const resposta = await fetch(`${url}/1abc`, {
            method: 'DELETE',
            headers: autorizacao
        });

        const corpo = await resposta.json();

        assert.equal(resposta.status, 400);
        assert.equal(corpo.erro.codigo, 'ID_ANTICONCEPCIONAL_INVALIDO');
        assert.equal(banco.estado.anticoncepcional.ativo, true);
        assert.equal(banco.estado.notificacoes[0].statusEnvio, 'agendada');
    });
});

test('uma segunda remoção não informa sucesso novamente', async () => {
    const banco = criarBanco();

    await comApi(banco, async (url) => {
        const primeiraResposta = await fetch(`${url}/1`, {
            method: 'DELETE',
            headers: autorizacao
        });

        const segundaResposta = await fetch(`${url}/1`, {
            method: 'DELETE',
            headers: autorizacao
        });

        const segundoCorpo = await segundaResposta.json();

        assert.equal(primeiraResposta.status, 200);
        assert.equal(segundaResposta.status, 404);
        assert.equal(
            segundoCorpo.erro.codigo,
            'ANTICONCEPCIONAL_NAO_ENCONTRADO'
        );
    });
});