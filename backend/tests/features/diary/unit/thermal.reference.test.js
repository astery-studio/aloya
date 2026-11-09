import assert from 'node:assert/strict';
import test from 'node:test';

import { CONFIGURACOES_TERMICAS_CAUSAIS } from '../../../../src/features/diary/thermal/thermal.config.js';
import { obterReferencia } from '../../../../src/features/diary/thermal/thermal.reference.js';

const config = (variante, disponibilidade) =>
    CONFIGURACOES_TERMICAS_CAUSAIS.find(
        (item) => item.variante === variante && item.disponibilidade === disponibilidade
    );
const medicao = (data, valorDecimos = 360, perturbada = false) => ({
    data,
    valorDecimos,
    perturbada
});

test('B1 exige os seis dias anteriores válidos', () => {
    const completas = [1, 2, 3, 4, 5, 6].map((dia) => medicao(`2026-01-0${dia}`));
    assert.equal(obterReferencia(completas, '2026-01-07', config('A1', 'B1')).length, 6);
    assert.equal(obterReferencia(completas.slice(1), '2026-01-07', config('A1', 'B1')), null);
    completas[2].perturbada = true;
    assert.equal(obterReferencia(completas, '2026-01-07', config('A1', 'B1')), null);
});

test('B2 usa seis medições válidas em nove dias sem consultar o futuro', () => {
    const medicoes = [1, 2, 4, 5, 7, 8, 10].map((dia) =>
        medicao(`2026-01-${String(dia).padStart(2, '0')}`)
    );
    const referencia = obterReferencia(medicoes, '2026-01-10', config('A1', 'B2'));
    assert.deepEqual(referencia.map((item) => item.data), medicoes.slice(0, 6).map((item) => item.data));
    medicoes[0].perturbada = true;
    assert.equal(obterReferencia(medicoes, '2026-01-10', config('A1', 'B2')), null);
});

