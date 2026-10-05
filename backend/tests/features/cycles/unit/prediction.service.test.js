import assert from 'node:assert/strict';
import test from 'node:test';

import { criarPredictionService } from '../../../../src/features/cycles/prediction.service.js';

test('consulta somente dados da pessoa autenticada e limita o histórico', async () => {
    let consulta;
    const prisma = { usuario: { findUnique: async (argumento) => {
        consulta = argumento;
        return {
            duracaoCicloInformada: 28, duracaoMenstruacaoInformada: 5,
            duracaoLuteaInformada: 14,
            registrosCiclo: [{ dataInicio: new Date('2026-10-01T00:00:00Z'), dataFim: null }]
        };
    } } };
    const service = criarPredictionService({
        prisma, agora: () => new Date('2026-10-05T12:00:00Z')
    });

    const resultado = await service.buscar(42);

    assert.deepEqual(consulta.where, { id: 42 });
    assert.equal(consulta.select.registrosCiclo.take, 7);
    assert.deepEqual(consulta.select.registrosCiclo.select, {
        dataInicio: true, dataFim: true
    });
    assert.equal(resultado.proximoInicioEstimado, '2026-10-29');
    assert.equal(resultado.dataGeracao, '2026-10-05T12:00:00.000Z');
});
