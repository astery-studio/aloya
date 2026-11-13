import assert from 'node:assert/strict';
import test from 'node:test';

import { validarHistorico } from '../../../../src/features/diary/validators/diaryHistory.validator.js';

test('normaliza filtros combinados e mantém limites inclusivos', () => {
    const resultado = validarHistorico({
        limite: '25',
        dataInicio: '2026-01-01',
        dataFim: '2026-12-31',
        categorias: 'energia,sintomas_fisicos',
        fases: 'lutea,menstrual'
    });

    assert.equal(resultado.limite, 25);
    assert.deepEqual(resultado.filtros.categorias, ['energia', 'sintomas_fisicos']);
    assert.deepEqual(resultado.filtros.fases, ['lutea', 'menstrual']);
});

test('rejeita período invertido', () => {
    assert.throws(() => validarHistorico({ dataInicio: '2026-12-31', dataFim: '2026-01-01' }), {
        codigo: 'PERIODO_DIARIO_INVALIDO'
    });
});

for (const query of [
    { limite: '0' },
    { limite: '51' },
    { fases: 'clinica' },
    { categorias: 'inexistente' },
    { usuarioId: '1' }
]) {
    test(`rejeita filtro inválido: ${JSON.stringify(query)}`, () => {
        assert.throws(() => validarHistorico(query));
    });
}
