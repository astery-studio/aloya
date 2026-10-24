import assert from 'node:assert/strict';
import test from 'node:test';

import { mediana } from '../../../../src/features/cycles/utils/statistics.js';

test('arredonda mediana positiva com meio dia para cima', () => {
    assert.equal(mediana([30, 27, 29, 28]), 29);
    assert.equal(mediana([31, 27, 29]), 29);
});

test('rejeita conjunto vazio e valores não finitos', () => {
    assert.throws(() => mediana([]), /valores numéricos finitos/);
    assert.throws(() => mediana([28, Number.NaN]), /valores numéricos finitos/);
    assert.throws(() => mediana([28, Infinity]), /valores numéricos finitos/);
});
