const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarPasswordRecoveryValidator
} = require(
    '../src/validators/passwordRecovery.validator'
);

function criarValidator() {
    return criarPasswordRecoveryValidator();
}

test(
    'aceita e normaliza o e-mail da recuperação',
    () => {
        const validator =
            criarValidator();

        const resultado =
            validator.validarSolicitacao({
                email:
                    '  CARLA@EMAIL.COM  '
            });

        assert.deepEqual(resultado, {
            valido: true,
            erros: [],

            dados: {
                email:
                    'carla@email.com'
            }
        });
    }
);