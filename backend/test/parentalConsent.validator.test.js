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

test(
    'rejeita solicitação sem e-mail do responsável',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarSolicitacao({});

        assert.equal(resultado.valido, false);

        assert.deepEqual(resultado.erros, [
            {
                campo:
                    'emailResponsavelLegal',

                mensagem:
                    'Informe um e-mail válido.'
            }
        ]);
    }
);

test(
    'rejeita e-mail inválido na solicitação',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarSolicitacao({
                emailResponsavelLegal:
                    'email-invalido'
            });

        assert.equal(resultado.valido, false);

        assert.deepEqual(resultado.erros, [
            {
                campo:
                    'emailResponsavelLegal',

                mensagem:
                    'Informe um e-mail válido.'
            }
        ]);
    }
);

test(
    'permite reenvio sem novo e-mail',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarReenvio({});

        assert.equal(resultado.valido, true);
        assert.deepEqual(resultado.erros, []);

        assert.deepEqual(resultado.dados, {
            emailResponsavelLegal: null
        });
    }
);

test(
    'normaliza o novo e-mail informado no reenvio',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarReenvio({
                emailResponsavelLegal:
                    '  NOVO@EMAIL.COM  '
            });

        assert.equal(resultado.valido, true);

        assert.deepEqual(resultado.dados, {
            emailResponsavelLegal:
                'novo@email.com'
        });
    }
);
