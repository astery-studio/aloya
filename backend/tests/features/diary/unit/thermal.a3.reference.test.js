import assert from 'node:assert/strict';
import test from 'node:test';

import { obterReferenciaFolicular } from '../../../../src/features/diary/thermal/thermal.a3.reference.js';

const medicao = (data, valorDecimos, perturbada = false) => ({ data, valorDecimos, perturbada });

test('A3 escolhe as seis menores medições foliculares válidas', () => {
    const medicoes = [
        medicao('2026-01-01', 365),
        medicao('2026-01-02', 360),
        medicao('2026-01-03', 361),
        medicao('2026-01-04', 362),
        medicao('2026-01-05', 363),
        medicao('2026-01-06', 364),
        medicao('2026-01-07', 350, true),
        medicao('2026-01-20', 350)
    ];
    const referencia = obterReferenciaFolicular(medicoes, '2026-01-10', 6);
    assert.deepEqual(referencia.map(({ valorDecimos }) => valorDecimos), [360, 361, 362, 363, 364, 365]);
});

test('A3 rejeita referência folicular insuficiente', () => {
    assert.equal(obterReferenciaFolicular([medicao('2026-01-01', 360)], '2026-01-02', 6), null);
});
