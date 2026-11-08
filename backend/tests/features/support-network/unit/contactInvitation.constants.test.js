import assert from 'node:assert/strict';
import test from 'node:test';

import {
    DURACAO_CONVITE_MS,
    papelEhTitular,
    usuarioEhContatoCadastrado
} from '../../../../src/features/support-network/constants/contactInvitation.constants.js';

test('reconhece somente os papéis que podem convidar contatos', () => {
    assert.equal(papelEhTitular('principal'), true);
    assert.equal(papelEhTitular('principal_e_contato_apoio'), true);
    assert.equal(papelEhTitular('contato_apoio'), false);
});

test('reconhece somente contas ativas com papel de contato', () => {
    assert.equal(
        usuarioEhContatoCadastrado({ papel: 'contato_apoio', statusConta: 'ativa' }),
        true
    );
    assert.equal(
        usuarioEhContatoCadastrado({ papel: 'principal_e_contato_apoio', statusConta: 'ativa' }),
        true
    );
    assert.equal(usuarioEhContatoCadastrado({ papel: 'principal', statusConta: 'ativa' }), false);
    assert.equal(
        usuarioEhContatoCadastrado({ papel: 'contato_apoio', statusConta: 'suspensa' }),
        false
    );
});

test('define convites com validade de sete dias', () => {
    assert.equal(DURACAO_CONVITE_MS, 7 * 24 * 60 * 60 * 1000);
});
