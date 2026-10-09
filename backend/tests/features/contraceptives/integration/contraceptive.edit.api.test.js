//Testa autenticação, autorização, validação e resposta HTTP da edição de anticoncepcionais.
import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';

import { criarContraceptiveController } from '../../../../src/features/contraceptives/contraceptive.controller.js';
import { criarRotasAnticoncepcionais } from '../../../../src/features/contraceptives/contraceptive.routes.js';
import { criarContraceptiveService } from '../../../../src/features/contraceptives/contraceptive.service.js';
import { criarAuthMiddleware } from '../../../../src/shared/middleware/auth.middleware.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const agora = new Date('2026-10-02T12:00:00.000Z');
const atualizadoEm = new Date('2026-10-01T10:00:00.000Z');

const entradaValida = {
    nome: 'Mercilon atualizado',
    tipo: 'pilula',
    frequenciaId: 'pilula_continuo',
    horarios: ['08:00'],
    dataPrimeiroUso: '2026-09-01',
    dataValidade: null,
    intensidadeAlerta: 'moderado'
};

const autorizacao = {
    authorization: 'Bearer token-seguro',
    'content-type': 'application/json'
};

//Cria um banco falso que respeita propriedade, concorrência, notificações e transação.
function criarBanco({usuarioDono = 7, existe = true} = {}) {
    let registro = {
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
        criadoEm: new Date('2026-09-01T12:00:00.000Z'),
        atualizadoEm
    };

    const banco = {
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
                if (!existe || where.id !== registro.id || where.usuarioId !== registro.usuarioId) return null;
                return {...registro};
            },

            async updateMany({where, data}) {
                const corresponde = existe
                    && where.id === registro.id
                    && where.usuarioId === registro.usuarioId
                    && where.atualizadoEm?.getTime() === registro.atualizadoEm.getTime();

                if (!corresponde) return {count: 0};

                registro = {
                    ...registro,
                    ...data,
                    atualizadoEm: agora
                };

                return {count: 1};
            }
        },

        notificacao: {
            async updateMany() {
                return {count: 1};
            },

            async create({data}) {
                return {
                    id: 1,
                    ...data
                };
            }
        },

        async $transaction(operacao) {
            return operacao(banco);
        }
    };

    return banco;
}

//Monta uma API real em porta temporária sem acessar rede externa.
async function comApi(banco, executar) {
    const app = express();
    const service = criarContraceptiveService(banco, () => agora);
    const controller = criarContraceptiveController(service);

    const authMiddleware = criarAuthMiddleware({
        prisma: banco,
        tokenService: {
            validarTokenSessao: () => ({usuarioId: 7}),
            gerarHashToken: () => 'hash-seguro'
        }
    });

    app.use(express.json());
    app.use('/api/anticoncepcionais', criarRotasAnticoncepcionais({
        autenticar: authMiddleware.autenticar,
        controller,
        edicaoRateLimit: (_requisicao, _resposta, proximo) => proximo()
    }));
    app.use(tratarErros);

    const servidor = app.listen(0);
    await new Promise((resolve) => servidor.once('listening', resolve));

    try {
        const {port} = servidor.address();
        return await executar(`http://127.0.0.1:${port}/api/anticoncepcionais`);
    } finally {
        await new Promise((resolve) => servidor.close(resolve));
    }
}

test('edita um anticoncepcional da própria usuária', async () => {
    await comApi(criarBanco(), async (url) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'PUT',
            headers: autorizacao,
            body: JSON.stringify(entradaValida)
        });

        const corpo = await resposta.json();

        assert.equal(resposta.status, 200);
        assert.equal(corpo.mensagem, 'Anticoncepcional atualizado com sucesso.');
        assert.equal(corpo.anticoncepcional.id, 1);
        assert.equal(corpo.anticoncepcional.nome, 'Mercilon atualizado');
        assert.equal(corpo.anticoncepcional.intensidadeAlerta, 'moderado');
    });
});

test('protege a edição com autenticação', async () => {
    await comApi(criarBanco(), async (url) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'PUT',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(entradaValida)
        });

        assert.equal(resposta.status, 401);
    });
});

test('não permite editar anticoncepcional pertencente a outra usuária', async () => {
    await comApi(criarBanco({usuarioDono: 8}), async (url) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'PUT',
            headers: autorizacao,
            body: JSON.stringify(entradaValida)
        });

        const corpo = await resposta.json();

        assert.equal(resposta.status, 404);
        assert.equal(corpo.erro.codigo, 'ANTICONCEPCIONAL_NAO_ENCONTRADO');
    });
});

test('não diferencia recurso inexistente de recurso pertencente a outra usuária', async () => {
    const respostas = [];

    await comApi(criarBanco({existe: false}), async (url) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'PUT',
            headers: autorizacao,
            body: JSON.stringify(entradaValida)
        });

        respostas.push({
            status: resposta.status,
            corpo: await resposta.json()
        });
    });

    await comApi(criarBanco({usuarioDono: 8}), async (url) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'PUT',
            headers: autorizacao,
            body: JSON.stringify(entradaValida)
        });

        respostas.push({
            status: resposta.status,
            corpo: await resposta.json()
        });
    });

    assert.deepEqual(respostas[0], respostas[1]);
});

test('rejeita identificador e corpo manipulados', async () => {
    await comApi(criarBanco(), async (url) => {
        const respostaId = await fetch(`${url}/1abc`, {
            method: 'PUT',
            headers: autorizacao,
            body: JSON.stringify(entradaValida)
        });

        const respostaCampo = await fetch(`${url}/1`, {
            method: 'PUT',
            headers: autorizacao,
            body: JSON.stringify({
                ...entradaValida,
                usuarioId: 8
            })
        });

        assert.equal(respostaId.status, 400);
        assert.equal((await respostaId.json()).erro.codigo, 'ID_ANTICONCEPCIONAL_INVALIDO');
        assert.equal(respostaCampo.status, 422);
        assert.equal((await respostaCampo.json()).erro.codigo, 'CAMPOS_NAO_PERMITIDOS');
    });
});