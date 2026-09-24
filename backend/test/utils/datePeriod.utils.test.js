import test from 'node:test';
import assert from 'node:assert/strict';

import {
    adicionarDias,
    calcularDiasInclusivos,
    gerarDiasMenstruacao
} from '../../src/utils/date.utils.js';

test('adiciona dias sem alterar a data original', () => {
    const original = new Date(2026, 0, 31);
    const resultado = adicionarDias(original, 1);

    assert.equal(original.getDate(), 31);
    assert.equal(resultado.getMonth(), 1);
    assert.equal(resultado.getDate(), 1);
});

test('calcula intervalo inclusivo e gera todos os dias menstruais', () => {
    const inicio = new Date(2026, 0, 30);
    const fim = new Date(2026, 1, 2);

    assert.equal(calcularDiasInclusivos(inicio, fim), 4);
    assert.deepEqual(gerarDiasMenstruacao(inicio, fim), [
        new Date(2026, 0, 30),
        new Date(2026, 0, 31),
        new Date(2026, 1, 1),
        new Date(2026, 1, 2)
    ]);
});
