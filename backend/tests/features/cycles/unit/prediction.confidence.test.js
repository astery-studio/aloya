import assert from 'node:assert/strict';
import test from 'node:test';

import { classificarConfiabilidade } from '../../../../src/features/cycles/utils/prediction.confidence.js';
import { ORIGENS } from '../../../../src/features/cycles/utils/prediction.duration.js';

const classificar = (valores, extras = {}) => classificarConfiabilidade({
    intervalos: valores.map((duracao) => ({ duracao })),
    origem: ORIGENS.HISTORICO, ...extras
});

test('mantém baixa com padrão, histórico curto, ambiguidade ou alta variação', () => {
    assert.equal(classificarConfiabilidade({ intervalos: [], origem: ORIGENS.PADRAO }).nivel, 'BAIXA');
    assert.equal(classificar([28, 29]).nivel, 'BAIXA');
    assert.equal(classificar([28, 29, 30], { ambiguidades: ['DUPLICIDADE'] }).nivel, 'BAIXA');
    assert.equal(classificar([20, 28, 36]).nivel, 'BAIXA');
});

test('distingue variação moderada, mudança recente e histórico consistente', () => {
    assert.equal(classificar([25, 28, 34]).nivel, 'MEDIA');
    assert.ok(classificar([28, 28, 29, 28, 29, 38]).motivos.includes('MUDANCA_RECENTE'));
    assert.deepEqual(classificar([27, 28, 29, 28, 27, 29]), {
        nivel: 'ALTA', motivos: ['HISTORICO_CONSISTENTE']
    });
});

test('ambiguidade prevalece sobre histórico numericamente consistente', () => {
    const resultado = classificar(
        [27, 28, 29, 28, 27, 29],
        { ambiguidades: ['INICIOS_DUPLICADOS'] }
    );

    assert.equal(resultado.nivel, 'BAIXA');
    assert.equal(resultado.motivos.includes('HISTORICO_CONSISTENTE'), false);
});
