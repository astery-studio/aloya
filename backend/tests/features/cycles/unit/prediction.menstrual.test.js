import assert from 'node:assert/strict';
import test from 'node:test';

import { preverMenstruacao, preverSangramento } from '../../../../src/features/cycles/prediction.menstrual.js';

test('estima o próximo início sem criar ciclos intermediários', () => {
    assert.deepEqual(preverMenstruacao({
        ultimoInicio: '2026-09-01', duracaoCiclo: 28,
        dataReferencia: '2026-09-29'
    }), { status: 'DISPONIVEL', proximoInicioEstimado: '2026-09-29' });

    assert.equal(preverMenstruacao({
        ultimoInicio: '2026-09-01', duracaoCiclo: 28,
        dataReferencia: '2026-10-30'
    }).status, 'PREVISAO_ULTRAPASSADA');
});

test('estima sangramento pela mediana sem alterar registros observados', () => {
    assert.deepEqual(preverSangramento('2026-10-01', [4, 5, 6, 7], null), {
        inicio: '2026-10-01', fim: '2026-10-05',
        tipo: 'FUTURO_PREVISTO', origemDuracao: 'HISTORICO_INDIVIDUAL'
    });
    assert.equal(preverSangramento('2026-10-01', [], null).fim, '2026-10-05');
});
