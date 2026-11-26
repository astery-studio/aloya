//Confirma que o limite de edição é executado somente no PUT e depois da autenticação.
import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import rateLimit from 'express-rate-limit';

import { criarRotasAnticoncepcionais } from '../../../../src/features/contraceptives/routes/contraceptive.routes.js';
import {
    criarEdicaoAnticoncepcionalRateLimit,
    criarUsoAnticoncepcionalRateLimit
} from '../../../../src/features/contraceptives/middleware/contraceptiveRateLimit.middleware.js';

//Inicia uma API temporária e entrega sua URL ao teste.
async function comApi({ autenticado = true, limitarEdicao, limitarUso }, executar) {
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
        eventos.push('rateLimit');
        proximo();
    }

    const controller = {
        listar(_requisicao, resposta) {
            eventos.push('listar');
            resposta.json({
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
            resposta.json({
                anticoncepcional: {
                    id: 1
                }
            });
        },

        remover(_requisicao, resposta) {
            eventos.push('remover');
            resposta.json({
                mensagem: 'Anticoncepcional removido com sucesso.'
            });
        },

        apagarDefinitivamente(_requisicao, resposta) {
            eventos.push('apagarDefinitivamente');
            resposta.status(204).end();
        }
    };

    const usoController = limitarUso ? {
        definirConfirmacao(_requisicao, resposta) { resposta.status(200).end(); },
        corrigirHistorico(_requisicao, resposta) { resposta.status(200).end(); },
        apagarRegistroHistorico(_requisicao, resposta) { resposta.status(204).end(); }
    } : undefined;

    app.use(express.json());

    app.use('/api/anticoncepcionais', criarRotasAnticoncepcionais({
        autenticar,
        controller,
        edicaoRateLimit: limitarEdicao ?? edicaoRateLimit,
        usoRateLimit: limitarUso,
        usoController
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

test('executa o limite entre autenticação e edição', async () => {
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
            'rateLimit',
            'editar'
        ]);
    });
});

test('não executa o limite quando a autenticação falha', async () => {
    await comApi({autenticado: false}, async (url, eventos) => {
        const resposta = await fetch(`${url}/1`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: '{}'
        });

        assert.equal(resposta.status, 401);

        assert.deepEqual(eventos, [
            'autenticar'
        ]);
    });
});

test('não limita listagem nem cadastro', async () => {
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

        assert.equal(eventos.includes('rateLimit'), false);
    });
});

test('permite revisar dois meses de histórico mesmo com o limite de edição ocupado', async () => {
    const logger = { warn() {} };
    const limitarEdicao = criarEdicaoAnticoncepcionalRateLimit({
        rateLimit, logger, janelaMs: 60_000, limite: 1
    });
    const limitarUso = criarUsoAnticoncepcionalRateLimit({ rateLimit, logger });

    await comApi({ limitarEdicao, limitarUso }, async (url) => {
        const editar = () => fetch(`${url}/1`, { method: 'PUT' });
        assert.equal((await editar()).status, 200);
        assert.equal((await editar()).status, 429);

        for (let id = 1; id <= 62; id += 1) {
            const resposta = await fetch(`${url}/1/usos/${id}`, { method: 'DELETE' });
            assert.equal(resposta.status, 204, `Exclusão ${id}`);
        }
    });
});
