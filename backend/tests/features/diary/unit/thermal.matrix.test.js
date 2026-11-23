import assert from 'node:assert/strict';
import test from 'node:test';

import { executarMatrizTermica } from '../../../../src/features/diary/thermal/thermal.matrix.js';

const serie = (quantidade) =>
    Array.from({ length: quantidade }, (_, indice) => ({
        data: `2026-01-${String(indice + 1).padStart(2, '0')}`,
        valorDecimos: indice < 6 ? 360 : 363,
        perturbada: false
    }));

test('feature flag desabilita toda a execução experimental', () => {
    assert.deepEqual(executarMatrizTermica([], { execucaoHabilitada: false }), []);
});

test('ciclo incompleto executa somente variantes causais', () => {
    const resultados = executarMatrizTermica(serie(9));
    assert.equal(resultados.length, 6);
    assert.ok(resultados.every(({ config }) => config.modo === 'causal'));
});

test('ciclo concluído acrescenta A3 e A4-R sem misturá-las à causalidade', () => {
    const resultados = executarMatrizTermica(serie(20), {
        cicloConcluido: true,
        dataFimCiclo: '2026-01-20',
        dataLimiteFolicularIndependente: '2026-01-06'
    });
    assert.deepEqual(
        resultados.slice(-2).map(({ config }) => config.variante),
        ['A3', 'A4-R']
    );
    assert.ok(resultados.slice(-2).every(({ resultado }) => resultado.modo === 'retrospectivo'));
});
