import assert from 'node:assert/strict';
import test from 'node:test';

import { criarPredictionController, MENSAGEM_ERRO } from '../../../../src/features/cycles/prediction.controller.js';

test('busca previsão usando somente a identidade da sessão', async () => {
    let usuarioRecebido;
    const controller = criarPredictionController({ predictionService: {
        buscar: async (usuarioId) => {
            usuarioRecebido = usuarioId;
            return { status: 'DISPONIVEL' };
        }
    } });
    let corpo;

    await controller.buscar({ usuario: { id: 8 }, query: { usuarioId: 99 } }, {
        json: (valor) => { corpo = valor; }
    }, assert.fail);

    assert.equal(usuarioRecebido, 8);
    assert.deepEqual(corpo, { previsao: { status: 'DISPONIVEL' } });
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
