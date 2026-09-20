import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarAuthValidator
} from '../src/validators/auth.validator.js';

function criarValidator() {
    return criarAuthValidator({
        dateUtils: {}
    });
}

test(
    'aceita credenciais válidas e normaliza o e-mail',
    () => {
        const validator = criarValidator();

        const resultado = validator.validarLogin({
            email: '  USUARIO@EMAIL.COM  ',
            senha: 'senha-segura'
        });

        assert.equal(resultado.valido, true);
        assert.deepEqual(resultado.erros, []);

        assert.deepEqual(resultado.dados, {
            email: 'usuario@email.com',
            senha: 'senha-segura'
        });
    }
);

test(
    'rejeita o login quando o e-mail está vazio',
    () => {
        const validator = criarValidator();

        const resultado = validator.validarLogin({
            email: '   ',
            senha: 'senha-segura'
        });

        assert.equal(resultado.valido, false);

        assert.deepEqual(resultado.erros, [
            {
                campo: 'email',
                mensagem: 'Informe seu e-mail.'
            }
        ]);
    }
);

test(
    'rejeita o login quando o e-mail possui formato inválido',
    () => {
        const validator = criarValidator();

        const resultado = validator.validarLogin({
            email: 'email-invalido',
            senha: 'senha-segura'
        });

        assert.equal(resultado.valido, false);

        assert.deepEqual(resultado.erros, [
            {
                campo: 'email',
                mensagem: 'Informe um e-mail válido.'
            }
        ]);
    }
);

test(
    'rejeita o login quando o e-mail ultrapassa o tamanho máximo',
    () => {
        const validator = criarValidator();

        const emailMuitoLongo =
            `${'a'.repeat(245)}@email.com`;

        const resultado = validator.validarLogin({
            email: emailMuitoLongo,
            senha: 'senha-segura'
        });

        assert.equal(emailMuitoLongo.length, 255);
        assert.equal(resultado.valido, false);

        assert.deepEqual(resultado.erros, [
            {
                campo: 'email',
                mensagem: 'Informe um e-mail válido.'
            }
        ]);
    }
);

test(
    'rejeita o login quando a senha está vazia',
    () => {
        const validator = criarValidator();

        const resultado = validator.validarLogin({
            email: 'usuario@email.com',
            senha: ''
        });

        assert.equal(resultado.valido, false);

        assert.deepEqual(resultado.erros, [
            {
                campo: 'senha',
                mensagem: 'Informe sua senha.'
            }
        ]);
    }
);

test(
    'retorna todos os erros quando e-mail e senha não são informados',
    () => {
        const validator = criarValidator();

        const resultado = validator.validarLogin({});

        assert.equal(resultado.valido, false);

        assert.deepEqual(resultado.erros, [
            {
                campo: 'email',
                mensagem: 'Informe seu e-mail.'
            },
            {
                campo: 'senha',
                mensagem: 'Informe sua senha.'
            }
        ]);

        assert.deepEqual(resultado.dados, {
            email: '',
            senha: ''
        });
    }
);