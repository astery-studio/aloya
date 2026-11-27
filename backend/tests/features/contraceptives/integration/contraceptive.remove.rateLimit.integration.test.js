//Confirma que o limite de remoção é executado somente no DELETE e depois da autenticação.
import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import rateLimit from 'express-rate-limit';

import { criarRemocaoAnticoncepcionalRateLimit } from '../../../../src/features/contraceptives/middleware/contraceptiveRateLimit.middleware.js';
import { criarRotasAnticoncepcionais } from '../../../../src/features/contraceptives/routes/contraceptive.routes.js';

//Inicia uma API temporária e registra a ordem dos middlewares e controllers.
async function comApi({autenticado = true, limitarRemocoes}, executar) {
    const eventos = [];
    const app = express();

    function autenticar(requisicao, resposta, proximo) {
        eventos.push('autenticar');

        if (!autenticado) {
            return resposta.status(401).json({
                erro: {
                    codigo: 'NAO_AUTENTICADO',
                    mensagem: 'Autenticação necessária.'
                }
            });
        }

        requisicao.usuario = { id: 1 };
        proximo();
    }

    function edicaoRateLimit(_requisicao, _resposta, proximo) {
        eventos.push('limiteEdicao');
        proximo();
    }

    function remocaoRateLimit(_requisicao, _resposta, proximo) {
        eventos.push('limiteRemocao');
        proximo();
    }

    const controller = {
        listar(_requisicao, resposta) {
            eventos.push('listar');

            resposta.status(200).json({
                anticoncepcionais: []
            });
        },

        cadastrar(_requisicao, resposta) {
            eventos.push('cadastrar');

            resposta.status(201).json({
                anticoncepcional: {
                    id: 1
                }
            });
        },

        editar(_requisicao, resposta) {
            eventos.push('editar');

            resposta.status(200).json({
                anticoncepcional: {
                    id: 1
                }
            });
        },

        remover(_requisicao, resposta) {
            eventos.push('remover');

            resposta.status(200).json({
                mensagem: 'Anticoncepcional removido com sucesso.'
            });
        },

        apagarDefinitivamente(_requisicao, resposta) {
            eventos.push('apagarDefinitivamente');
            resposta.status(204).end();
        }
    };

    app.use(express.json());

    app.use('/api/anticoncepcionais', criarRotasAnticoncepcionais({
        autenticar,
        controller,
        edicaoRateLimit,
        remocaoRateLimit: limitarRemocoes ?? remocaoRateLimit
    }));

    const servidor = app.listen(0);
    await new Promise((resolve) => servidor.once('listening', resolve));

    try {
        const {port} = servidor.address();

        await executar(
            `http://127.0.0.1:${port}/api/anticoncepcionais`,
            eventos
        );
    } finally {
        await new Promise((resolve) => servidor.close(resolve));
    }
}

test('permite remover e apagar seis anticoncepcionais antes de responder 429', async () => {
    const limitarRemocoes = criarRemocaoAnticoncepcionalRateLimit({
        rateLimit,
        janelaMs: 60_000,
        limite: 12,
        logger: { warn() {} }
    });

    await comApi({ limitarRemocoes }, async (url) => {
        for (let id = 1; id <= 6; id += 1) {
            const remocao = await fetch(`${url}/${id}`, { method: 'DELETE' });
            assert.equal(remocao.status, 200);
            await remocao.json();

            const exclusao = await fetch(`${url}/${id}/definitivo`, { method: 'DELETE' });
            assert.equal(exclusao.status, 204);
        }

        const bloqueio = await fetch(`${url}/7`, { method: 'DELETE' });
        assert.equal(bloqueio.status, 429);
        assert.equal((await bloqueio.json()).erro.codigo, 'LIMITE_REMOCOES_ANTICONCEPCIONAL');
    });
});

test('executa autenticação, limite de remoção e controller nessa ordem', async () => {
    await comApi({autenticado: true}, async (url, eventos) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'DELETE'
        });

        assert.equal(resposta.status, 200);

        assert.deepEqual(eventos, [
            'autenticar',
            'limiteRemocao',
            'remover'
        ]);

        assert.equal(eventos.includes('limiteEdicao'), false);
    });
});

test('não executa o limite nem o controller quando a autenticação falha', async () => {
    await comApi({autenticado: false}, async (url, eventos) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'DELETE'
        });

        assert.equal(resposta.status, 401);

        assert.deepEqual(eventos, [
            'autenticar'
        ]);

        assert.equal(eventos.includes('limiteRemocao'), false);
        assert.equal(eventos.includes('remover'), false);
    });
});

test('edição utiliza somente o limite de edição', async () => {
    await comApi({autenticado: true}, async (url, eventos) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: '{}'
        });

        assert.equal(resposta.status, 200);

        assert.deepEqual(eventos, [
            'autenticar',
            'limiteEdicao',
            'editar'
        ]);

        assert.equal(eventos.includes('limiteRemocao'), false);
    });
});

test('listagem e cadastro não consomem o limite de remoção', async () => {
    await comApi({autenticado: true}, async (url, eventos) => {
        const respostaListagem = await fetch(url);

        const respostaCadastro = await fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: '{}'
        });

        assert.equal(respostaListagem.status, 200);
        assert.equal(respostaCadastro.status, 201);

        assert.deepEqual(eventos, [
            'autenticar',
            'listar',
            'autenticar',
            'cadastrar'
        ]);

        assert.equal(eventos.includes('limiteRemocao'), false);
        assert.equal(eventos.includes('limiteEdicao'), false);
    });
});
