const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarParentalConsentValidator
} = require(
    '../src/validators/parentalConsent.validator'
);

function criarValidator() {
    return criarParentalConsentValidator();
}

test(
    'aceita e normaliza o e-mail na solicitação',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarSolicitacao({
                emailResponsavelLegal:
                    '  RESPONSAVEL@EMAIL.COM  '
            });

        assert.equal(resultado.valido, true);
        assert.deepEqual(resultado.erros, []);

        assert.deepEqual(resultado.dados, {
            emailResponsavelLegal:
                'responsavel@email.com'
        });
    }
);
