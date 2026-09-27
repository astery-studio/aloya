import test from 'node:test';
import assert from 'node:assert/strict';

import { criarAuthValidator } from '../../src/validators/auth.validator.js';
import { criarPasswordRecoveryValidator } from '../../src/validators/passwordRecovery.validator.js';
import { criarParentalConsentValidator } from '../../src/validators/parentalConsent.validator.js';

test('corpos nulos são rejeitados sem provocar erro interno', () => {
    const auth = criarAuthValidator({ dateUtils: {} });
    const recuperacao = criarPasswordRecoveryValidator();
    const consentimento = criarParentalConsentValidator();

    assert.equal(auth.validarLogin(null).valido, false);
    assert.equal(recuperacao.validarSolicitacao(null).valido, false);
    assert.equal(recuperacao.validarRedefinicao(null).valido, false);
    assert.equal(consentimento.validarSolicitacao(null).valido, false);
    assert.equal(consentimento.validarReenvio(null).valido, true);
});

test('senhas excessivas são barradas antes do bcrypt', () => {
    const senha = 'a'.repeat(129);
    const auth = criarAuthValidator({ dateUtils: {} });
    const recuperacao = criarPasswordRecoveryValidator();

    assert.equal(auth.validarLogin({ email: 'a@b.com', senha }).valido, false);
    assert.equal(recuperacao.validarRedefinicao({ token: 'x', senha }).valido, false);
});
