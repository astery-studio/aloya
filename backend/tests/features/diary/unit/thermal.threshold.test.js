import assert from 'node:assert/strict';
import test from 'node:test';

import { CONFIGURACOES_TERMICAS_CAUSAIS } from '../../../../src/features/diary/thermal/thermal.config.js';
import { atingiuLimiar } from '../../../../src/features/diary/thermal/thermal.threshold.js';

const config = (variante) =>
    CONFIGURACOES_TERMICAS_CAUSAIS.find((item) => item.variante === variante);

test('limiares usam aritmética inteira para média e maior valor', () => {
    const referencia = [363, 364, 364, 365, 364, 365].map((valorDecimos) => ({ valorDecimos }));
    assert.equal(atingiuLimiar(referencia, 366, config('A1')), false);
    assert.equal(atingiuLimiar(referencia, 367, config('A1')), true);
    assert.equal(atingiuLimiar(referencia, 367, config('A2')), false);
    assert.equal(atingiuLimiar(referencia, 367, config('A4-C')), true);
});
