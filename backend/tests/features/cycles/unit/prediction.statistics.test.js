import assert from 'node:assert/strict';
import test from 'node:test';

import {
    ORIGENS,
    mediana,
    selecionarDuracao
} from '../../../../src/features/cycles/utils/statistics.js';

test('arredonda mediana positiva com meio dia para cima', () => {
    assert.equal(mediana([30, 27, 29, 28]), 29);
    assert.equal(mediana([31, 27, 29]), 29);
});

test('usa no máximo os seis intervalos mais recentes', () => {
    const intervalos = [20, 21, 26, 27, 28, 29, 30, 31]
        .map((duracao) => ({ duracao }));
    assert.deepEqual(selecionarDuracao(intervalos, 25, 28), {
        valor: 29, origem: ORIGENS.HISTORICO, quantidade: 6
    });
});

test('usa duração declarada antes do padrão provisório', () => {
    assert.deepEqual(selecionarDuracao([], 32, 28), {
        valor: 32, origem: ORIGENS.DECLARADA, quantidade: 0
    });
    assert.deepEqual(selecionarDuracao([], null, 28), {
        valor: 28, origem: ORIGENS.PADRAO, quantidade: 0
    });
});
