import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarPasswordRecoveryValidator
} from '../src/validators/passwordRecovery.validator.js';

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

test(
    'rejeita solicitação sem e-mail',
    () => {
        const validator =
            criarValidator();

        const resultado =
            validator.validarSolicitacao({});

        assert.equal(
            resultado.valido,
            false
        );

        assert.deepEqual(
            resultado.erros,
            [
                {
                    campo: 'email',
                    mensagem:
                        'Informe seu e-mail.'
                }
            ]
        );
    }
);

test(
    'rejeita e-mail inválido na recuperação',
    () => {
        const validator =
            criarValidator();

        const resultado =
            validator.validarSolicitacao({
                email: 'email-invalido'
            });

        assert.equal(
            resultado.valido,
            false
        );

        assert.deepEqual(
            resultado.erros,
            [
                {
                    campo: 'email',
                    mensagem:
                        'Informe um e-mail válido.'
                }
            ]
        );
    }
);

test('aceita token e nova senha válidos', () => {
    const resultado = criarValidator().validarRedefinicao({
        token: 'jwt-valido',
        senha: 'nova-senha'
    });

    assert.deepEqual(resultado, {
        valido: true,
        erros: [],
        dados: { token: 'jwt-valido', senha: 'nova-senha' }
    });
});

test('rejeita token ausente e senha curta', () => {
    const resultado = criarValidator().validarRedefinicao({ senha: '123' });

    assert.equal(resultado.valido, false);
    assert.deepEqual(
        resultado.erros.map(({ campo }) => campo),
        ['token', 'senha']
    );
});
