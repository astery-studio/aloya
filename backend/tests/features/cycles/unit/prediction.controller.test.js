import assert from 'node:assert/strict';
import test from 'node:test';

import { criarPredictionController, MENSAGEM_ERRO } from '../../../../src/features/cycles/controllers/prediction.controller.js';

test('busca previsão usando somente a identidade da sessão', async () => {
    let usuarioRecebido;
    const controller = criarPredictionController({ predictionService: {
        buscar: async (usuarioId) => {
            usuarioRecebido = usuarioId;
            return { status: 'DISPONIVEL' };
        }
    } });
    let corpo;

    let cacheControl;
    await controller.buscar({ usuario: { id: 8 }, query: { usuarioId: 99 } }, {
        set: (nome, valor) => { cacheControl = `${nome}: ${valor}`; },
        json: (valor) => { corpo = valor; }
    }, assert.fail);

    assert.equal(usuarioRecebido, 8);
    assert.deepEqual(corpo, { previsao: { status: 'DISPONIVEL' } });
    assert.equal(cacheControl, 'Cache-Control: private, no-store');
});

test('prepara mensagem segura para falha interna', async () => {
    const falha = new Error('detalhe do banco');
    const controller = criarPredictionController({ predictionService: {
        buscar: async () => { throw falha; }
    } });

    await controller.buscar({ usuario: { id: 8 } }, {}, (erro) => {
        assert.equal(erro.mensagemUsuario, MENSAGEM_ERRO);
    });
});

test('preserva a mensagem de um erro de domínio já classificado', async () => {
    const falha = Object.assign(new Error('Sessão inválida'), { status: 401 });
    const controller = criarPredictionController({
        predictionService: {
            buscar: async () => {
                throw falha;
            }
        }
    });

    let encaminhado;
    await controller.buscar({ usuario: { id: 8 } }, {}, (erro) => {
        encaminhado = erro;
    });

    assert.equal(encaminhado, falha);
    assert.equal(encaminhado.mensagemUsuario, undefined);
});
