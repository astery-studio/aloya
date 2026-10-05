import assert from 'node:assert/strict';
import test from 'node:test';

import { estimarFases, identificarFaseAtual } from '../../../../src/features/cycles/prediction.phases.js';

test('estima categorias educativas e janela fértil pelo calendário', () => {
    const resultado = estimarFases({
        inicioCiclo: '2026-10-01', fimMenstrual: '2026-10-05',
        proximoInicio: '2026-10-29', duracaoLutea: 14
    });
    assert.deepEqual(resultado.fases.ovulatoria, { data: '2026-10-14' });
    assert.deepEqual(resultado.fases.folicularPosMenstrual, {
        inicio: '2026-10-06', fim: '2026-10-13'
    });
    assert.deepEqual(resultado.fases.lutea, {
        inicio: '2026-10-15', fim: '2026-10-28'
    });
    assert.deepEqual(resultado.janelaFertil, {
        inicio: '2026-10-09', fim: '2026-10-14'
    });
    assert.equal(identificarFaseAtual(resultado.fases, '2026-10-05'), 'MENSTRUAL');
    assert.equal(identificarFaseAtual(resultado.fases, '2026-10-10'), 'FOLICULAR');
    assert.equal(identificarFaseAtual(resultado.fases, '2026-10-14'), 'OVULATORIA');
    assert.equal(identificarFaseAtual(resultado.fases, '2026-10-20'), 'LUTEA');
});

test('preserva previsão menstrual quando fases não cabem', () => {
    const resultado = estimarFases({
        inicioCiclo: '2026-10-01', fimMenstrual: '2026-10-12',
        proximoInicio: '2026-10-20', duracaoLutea: 14
    });

    assert.equal(resultado.fases, null);
    assert.equal(resultado.janelaFertil, null);
    assert.equal(resultado.motivo, 'INTERVALOS_DE_FASE_INCOMPATIVEIS');
    assert.equal(identificarFaseAtual(resultado.fases, '2026-10-10'), null);
});
