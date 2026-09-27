import test from 'node:test';
import assert from 'node:assert/strict';

import {
    calcularIdade,
    criarDataValida
} from '../../src/utils/date.utils.js';

test('cria apenas datas ISO reais', () => {
    assert.equal(criarDataValida(null), null);
    assert.equal(criarDataValida('13/05/2000'), null);
    assert.equal(criarDataValida('2025-02-29'), null);
    assert.deepEqual(
        criarDataValida('2024-02-29'),
        new Date(2024, 1, 29)
    );
});

test('calcula idade antes, no dia e depois do aniversário', () => {
    assert.equal(calcularIdade('2000-09-25', new Date(2026, 8, 24)), 25);
    assert.equal(calcularIdade('2000-09-24', new Date(2026, 8, 24)), 26);
    assert.equal(calcularIdade('2000-08-24', new Date(2026, 8, 24)), 26);
    assert.equal(calcularIdade('inválida'), null);
});

test('calcula idade de data retornada pelo Prisma em UTC', () => {
    assert.equal(
        calcularIdade(
            new Date('2010-09-25T00:00:00.000Z'),
            new Date(2026, 8, 24)
        ),
        15
    );
});
