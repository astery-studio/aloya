import assert from 'node:assert/strict';
import test from 'node:test';

import { validarIfMatch } from '../../../../src/features/diary/validators/diaryPrecondition.validator.js';

test('aceita ETag forte com versão inteira', () => {
    assert.equal(validarIfMatch('"0"'), 0);
    assert.equal(validarIfMatch('"42"'), 42);
});

for (const valor of [undefined, '', '0', 'W/"1"', '"-1"', '"1.5"']) {
    test(`rejeita precondição inválida: ${String(valor)}`, () => {
        assert.throws(() => validarIfMatch(valor), {
            codigo: 'PRECONDICAO_DIARIO_OBRIGATORIA',
            status: 428
        });
    });
}
