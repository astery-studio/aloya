import assert from 'node:assert/strict';
import test from 'node:test';

import {
    ORIGENS,
    selecionarDuracao
} from '../../../../src/features/cycles/prediction.duration.js';

test('prioriza durações históricas já selecionadas', () => {
    assert.deepEqual(selecionarDuracao([26, 27, 28, 29, 30, 31], 25, 28), {
        valor: 29,
        origem: ORIGENS.HISTORICO,
        quantidade: 6
    });
});

test('usa duração declarada antes do padrão provisório', () => {
    assert.deepEqual(selecionarDuracao([], 32, 28), {
        valor: 32,
        origem: ORIGENS.DECLARADA,
        quantidade: 0
    });
    assert.deepEqual(selecionarDuracao([], null, 28), {
        valor: 28,
        origem: ORIGENS.PADRAO,
        quantidade: 0
    });
});

test('rejeita durações inválidas sem filtrá-las silenciosamente', () => {
    assert.throws(() => selecionarDuracao([28, Number.NaN], null, 28));
    assert.throws(() => selecionarDuracao([28, Infinity], null, 28));
    assert.throws(() => selecionarDuracao([28, 0], null, 28));
    assert.throws(() => selecionarDuracao([], -1, 28));
});
