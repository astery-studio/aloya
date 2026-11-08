import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactRemovalValidator } from '../../../../src/features/support-network/validators/supportContactRemoval.validator.js';

const validator = criarSupportContactRemovalValidator();

test('aceita somente confirmação explícita da remoção', () => {
    assert.deepEqual(validator.validarConfirmacao({ confirmado: true }), {
        valido: true,
        dados: { confirmado: true }
    });

    for (const body of [{}, { confirmado: false }, { confirmado: 1 }, null, []]) {
        assert.equal(validator.validarConfirmacao(body).valido, false);
    }
});

test('rejeita campos internos e objetos com protótipo alterado', () => {
    const protegido = validator.validarConfirmacao({ confirmado: true, titularId: 99 });
    assert.equal(protegido.valido, false);
    assert.equal(protegido.erros.some(({ campo }) => campo === 'titularId'), true);

    const poluido = Object.create({ administrador: true });
    poluido.confirmado = true;
    assert.equal(validator.validarConfirmacao(poluido).valido, false);
});
