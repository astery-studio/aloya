import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactValidator } from '../../../../src/features/support-network/validators/supportContact.validator.js';

const validator = criarSupportContactValidator();

test('aceita identificador inteiro positivo recebido pela rota', () => {
    assert.deepEqual(validator.validarContatoId('42'), { valido: true, contatoId: 42 });
});

test('rejeita identificadores ambíguos, negativos ou fora do limite seguro', () => {
    for (const valor of ['', '0', '-1', '1.5', '1x', '9007199254740992', null]) {
        const resultado = validator.validarContatoId(valor);
        assert.equal(resultado.valido, false, String(valor));
        assert.equal(resultado.erro.codigo, 'CONTATO_ID_INVALIDO');
        assert.equal(resultado.erro.mensagem, 'Contato inválido.');
    }
});
