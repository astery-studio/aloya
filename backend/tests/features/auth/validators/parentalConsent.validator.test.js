/**
 * Testes dos contratos de entrada do consentimento parental.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { criarParentalConsentValidator } from '../../../../src/features/auth/validators/parentalConsent.validator.js';

function criarValidator() {
    return criarParentalConsentValidator();
}

test('aceita e normaliza o e-mail na solicitação', () => {
    const validator = criarValidator();

    const resultado = validator.validarSolicitacao({
        emailResponsavelLegal: '  RESPONSAVEL@EMAIL.COM  '
    });

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.erros, []);

    assert.deepEqual(resultado.dados, {
        emailResponsavelLegal: 'responsavel@email.com'
    });
});

test('rejeita solicitação sem e-mail do responsável', () => {
    const validator = criarValidator();

    const resultado = validator.validarSolicitacao({});

    assert.equal(resultado.valido, false);

    assert.deepEqual(resultado.erros, [
        {
            campo: 'emailResponsavelLegal',

            mensagem: 'Informe um e-mail válido.'
        }
    ]);
});

test('rejeita e-mail inválido na solicitação', () => {
    const validator = criarValidator();

    const resultado = validator.validarSolicitacao({
        emailResponsavelLegal: 'email-invalido'
    });

    assert.equal(resultado.valido, false);

    assert.deepEqual(resultado.erros, [
        {
            campo: 'emailResponsavelLegal',

            mensagem: 'Informe um e-mail válido.'
        }
    ]);
});

test('permite reenvio sem novo e-mail', () => {
    const validator = criarValidator();

    const resultado = validator.validarReenvio({});

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.erros, []);

    assert.deepEqual(resultado.dados, {
        emailResponsavelLegal: null
    });
});

test('normaliza o novo e-mail informado no reenvio', () => {
    const validator = criarValidator();

    const resultado = validator.validarReenvio({
        emailResponsavelLegal: '  NOVO@EMAIL.COM  '
    });

    assert.equal(resultado.valido, true);

    assert.deepEqual(resultado.dados, {
        emailResponsavelLegal: 'novo@email.com'
    });
});

test('rejeita novo e-mail inválido no reenvio', () => {
    const validator = criarValidator();

    const resultado = validator.validarReenvio({
        emailResponsavelLegal: 'email-invalido'
    });

    assert.equal(resultado.valido, false);

    assert.deepEqual(resultado.erros, [
        {
            campo: 'emailResponsavelLegal',

            mensagem: 'Informe um e-mail válido.'
        }
    ]);
});

test('aceita token de consentimento no formato esperado', () => {
    const validator = criarValidator();

    const tokenValido = 'a'.repeat(43);

    const resultado = validator.validarToken(tokenValido);

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.erros, []);

    assert.deepEqual(resultado.dados, {
        token: tokenValido
    });
});

test('rejeita corpos malformados e campos protegidos na solicitação', () => {
    const validator = criarParentalConsentValidator();

    for (const body of [null, [], 'email@exemplo.com', Object.create({ admin: true })]) {
        assert.equal(validator.validarSolicitacao(body).valido, false);
    }

    const resultado = validator.validarSolicitacao({
        emailResponsavelLegal: 'responsavel@email.com',
        titularMenorId: 999
    });
    assert.equal(resultado.valido, false);
    assert.match(resultado.erros[0].mensagem, /campos não permitidos/u);
});

test('aceita reenvio vazio, mas rejeita corpo malformado ou campo interno', () => {
    const validator = criarParentalConsentValidator();

    assert.equal(validator.validarReenvio({}).valido, true);
    assert.equal(validator.validarReenvio(undefined).valido, true);
    assert.equal(validator.validarReenvio(null).valido, false);
    assert.equal(
        validator.validarReenvio({ emailResponsavelLegal: null, statusConsentimento: 'liberado' })
            .valido,
        false
    );
});

test('aceita caracteres seguros para URL no token', () => {
    const validator = criarValidator();

    const tokenValido = `${'a'.repeat(41)}-_`;

    const resultado = validator.validarToken(tokenValido);

    assert.equal(tokenValido.length, 43);
    assert.equal(resultado.valido, true);
});

test('rejeita token com tamanho incorreto', () => {
    const validator = criarValidator();

    const resultado = validator.validarToken('token-curto');

    assert.equal(resultado.valido, false);

    assert.deepEqual(resultado.erros, [
        {
            campo: 'token',

            mensagem: 'Link de consentimento inválido.'
        }
    ]);
});

test('rejeita token com caracteres não permitidos', () => {
    const validator = criarValidator();

    const tokenInvalido = `${'a'.repeat(42)}!`;

    const resultado = validator.validarToken(tokenInvalido);

    assert.equal(tokenInvalido.length, 43);
    assert.equal(resultado.valido, false);

    assert.deepEqual(resultado.erros, [
        {
            campo: 'token',

            mensagem: 'Link de consentimento inválido.'
        }
    ]);
});
