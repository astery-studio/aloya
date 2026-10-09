import assert from 'node:assert/strict';
import test from 'node:test';

import { criarPredictionController } from '../../../../src/features/cycles/prediction.controller.js';

test('ignora identidade fornecida pelo cliente e não expõe dados internos', async () => {
    let identidadeConsultada;
    const controller = criarPredictionController({
        predictionService: {
            buscar: async (usuarioId) => {
                identidadeConsultada = usuarioId;
                return { status: 'DISPONIVEL', proximoInicioEstimado: '2026-10-29' };
            }
        }
    });
    let resposta;

    await controller.buscar({
        usuario: { id: 7 },
        query: { usuarioId: 99 },
        body: { usuarioId: 99 }
    }, {
        set: () => {},
        json: (valor) => { resposta = valor; }
    }, assert.fail);

    assert.equal(identidadeConsultada, 7);
    assert.equal('registrosCiclo' in resposta.previsao, false);
    assert.equal('usuarioId' in resposta.previsao, false);
});
