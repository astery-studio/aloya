import assert from 'node:assert/strict';
import test from 'node:test';

import { detectarA4R } from '../../../../src/features/diary/thermal/thermal.a4r.js';
import { CONFIGURACOES_TERMICAS_RETROSPECTIVAS } from '../../../../src/features/diary/thermal/thermal.config.js';

const config = CONFIGURACOES_TERMICAS_RETROSPECTIVAS.find(({ variante }) => variante === 'A4-R');
const serie = (valores) =>
    valores.map((valorDecimos, indice) => ({
        data: `2026-01-${String(indice + 1).padStart(2, '0')}`,
        valorDecimos,
        perturbada: false
    }));

test('A4-R exige ciclo concluído', () => {
    const resultado = detectarA4R(serie([360]), config);
    assert.equal(resultado.estado, 'INCONCLUSIVO');
    assert.equal(resultado.motivo, 'CICLO_NAO_CONCLUIDO');
});

test('A4-R aplica filtro retrospectivo sem consultar o ciclo seguinte', () => {
    const valores = Array(16).fill(364).concat([366, 366, 366], Array(11).fill(364));
    const medicoes = [...serie(valores), { data: '2026-02-01', valorDecimos: 390 }];
    const resultado = detectarA4R(medicoes, config, {
        cicloConcluido: true,
        dataFimCiclo: '2026-01-30'
    });
    assert.equal(resultado.inicioFiltro, '2026-01-17');
    assert.equal(resultado.estado, 'ELEVACAO_DETECTADA');
    assert.equal(resultado.sequencias[0].dataInicioElevacao, '2026-01-17');
});
