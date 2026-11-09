import assert from 'node:assert/strict';
import test from 'node:test';

import { CONFIGURACOES_TERMICAS_RETROSPECTIVAS } from '../../../../src/features/diary/thermal/thermal.config.js';
import { encontrarSequenciaFixa } from '../../../../src/features/diary/thermal/thermal.fixedSequence.js';

const config = CONFIGURACOES_TERMICAS_RETROSPECTIVAS.find(({ variante }) => variante === 'A3');
const referencia = Array.from({ length: 6 }, () => ({ valorDecimos: 360 }));
const serie = (valores) =>
    valores.map((valor, indice) => ({
        data: `2026-01-${String(indice + 10).padStart(2, '0')}`,
        valorDecimos: typeof valor === 'object' ? valor.valor : valor,
        perturbada: typeof valor === 'object' && valor.perturbada
    }));

test('encontra três temperaturas acima da referência fixa', () => {
    const resultado = encontrarSequenciaFixa(
        serie([362, 363, 363, 363]), '2026-01-10', '2026-01-13', referencia, config
    );
    assert.equal(resultado.janelasAvaliaveis, 2);
    assert.deepEqual(resultado.sequencia, {
        dataInicioElevacao: '2026-01-11',
        dataConfirmacao: '2026-01-13'
    });
});

test('lacuna e perturbação impedem sequência fixa', () => {
    const resultado = encontrarSequenciaFixa(
        serie([363, { valor: 363, perturbada: true }, 363]),
        '2026-01-10', '2026-01-12', referencia, config
    );
    assert.deepEqual(resultado, { janelasAvaliaveis: 0, sequencia: null });
});
