import assert from 'node:assert/strict';
import test from 'node:test';

import { detectarA3 } from '../../../../src/features/diary/thermal/thermal.a3.js';
import { CONFIGURACOES_TERMICAS_RETROSPECTIVAS } from '../../../../src/features/diary/thermal/thermal.config.js';

const config = CONFIGURACOES_TERMICAS_RETROSPECTIVAS.find(({ variante }) => variante === 'A3');
const serie = (valores) =>
    valores.map((valorDecimos, indice) => ({
        data: `2026-01-${String(indice + 1).padStart(2, '0')}`,
        valorDecimos,
        perturbada: false
    }));
const contexto = {
    cicloConcluido: true,
    dataLimiteFolicularIndependente: '2026-01-06',
    dataFimCiclo: '2026-01-09'
};

test('A3 exige ciclo concluído e limite folicular independente', () => {
    assert.equal(detectarA3([], config).estado, 'INCONCLUSIVO');
    assert.equal(detectarA3([], config, { cicloConcluido: true }).estado, 'INCONCLUSIVO');
});

test('A3 distingue referência insuficiente, ausência e elevação', () => {
    assert.equal(detectarA3(serie([360]), config, contexto).estado, 'DADOS_INSUFICIENTES');
    assert.equal(
        detectarA3(serie([360, 360, 360, 360, 360, 360]), config, contexto).estado,
        'DADOS_INSUFICIENTES'
    );
    assert.equal(
        detectarA3(serie([360, 360, 360, 360, 360, 360, 362, 362, 362]), config, contexto).estado,
        'NENHUMA_ELEVACAO_IDENTIFICADA'
    );
    const detectada = detectarA3(
        serie([360, 360, 360, 360, 360, 360, 363, 363, 363]),
        config,
        contexto
    );
    assert.equal(detectada.estado, 'ELEVACAO_DETECTADA');
    assert.equal(detectada.referencia.length, 6);
});
