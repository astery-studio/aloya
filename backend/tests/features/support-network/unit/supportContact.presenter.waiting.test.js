import assert from 'node:assert/strict';
import test from 'node:test';

import {
    calcularDiasAguardando,
    criarResumoEspera
} from '../../../../src/features/support-network/presenters/supportContact.presenter.js';

test('calcula a espera por dias civis UTC sem produzir valores negativos', () => {
    const agora = new Date('2026-11-08T01:00:00.000Z');

    assert.equal(calcularDiasAguardando(new Date('2026-11-05T23:00:00.000Z'), agora), 3);
    assert.equal(calcularDiasAguardando(new Date('2026-11-09T00:00:00.000Z'), agora), 0);
});

test('marca como atrasado somente após sete dias completos no calendário', () => {
    const agora = new Date('2026-11-08T12:00:00.000Z');

    assert.deepEqual(
        criarResumoEspera('pendente', new Date('2026-11-01T12:00:00.000Z'), agora),
        {
            dias: 7,
            atrasado: false,
            rotulo: 'Aguardando há 7 dias'
        }
    );
    assert.equal(
        criarResumoEspera('pendente', new Date('2026-10-31T12:00:00.000Z'), agora).atrasado,
        true
    );
});

test('não apresenta tempo de espera para vínculo ativo', () => {
    assert.equal(criarResumoEspera('ativo', new Date(), new Date()), null);
});

test('trata datas inválidas sem propagar NaN para a API', () => {
    assert.equal(calcularDiasAguardando(null, new Date()), 0);
    assert.equal(calcularDiasAguardando(new Date(), new Date('inválida')), 0);
});
