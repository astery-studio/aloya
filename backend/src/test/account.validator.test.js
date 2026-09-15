const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarAccountValidator
} = require('../src/validators/account.validator');

const dateUtils =
    require('../src/utils/date.utils');

function criarValidator() {
    return criarAccountValidator({
        dateUtils
    });
}

test(
    'normaliza nome e e-mail na atualização',
    function () {
        const validator = criarValidator();

        const resultado =
            validator.validarAtualizacao({
                nome: '  Carla   Cristina  ',
                email: ' CARLA@EMAIL.COM '
            });

        assert.equal(resultado.valido, true);

        assert.equal(
            resultado.dados.nome,
            'Carla Cristina'
        );

        assert.equal(
            resultado.dados.email,
            'carla@email.com'
        );
    }
);

test(
    'aceita identidade de gênero permitida',
    function () {
        const validator = criarValidator();

        const resultado =
            validator.validarAtualizacao({
                identidadeGenero:
                    'Mulher Cisgênero'
            });

        assert.equal(resultado.valido, true);

        assert.equal(
            resultado.dados.identidadeGenero,
            'Mulher Cisgênero'
        );
    }
);

test(
    'rejeita identidade de gênero arbitrária',
    function () {
        const validator = criarValidator();

        const resultado =
            validator.validarAtualizacao({
                identidadeGenero:
                    'valor não permitido'
            });

        assert.equal(resultado.valido, false);
    }
);

test(
    'rejeita campos que não pertencem à HU-004',
    function () {
        const validator = criarValidator();

        const resultado =
            validator.validarAtualizacao({
                nome: 'Carla Cristina',
                papel: 'administrador'
            });

        assert.equal(resultado.valido, false);

        assert.equal(
            resultado.erros[0].campo,
            'dados'
        );
    }
);

test(
    'rejeita data de nascimento futura',
    function () {
        const validator = criarValidator();

        const anoFuturo =
            new Date().getFullYear() + 1;

        const resultado =
            validator.validarAtualizacao({
                dataNascimento:
                    `${anoFuturo}-01-01`
            });

        assert.equal(resultado.valido, false);
    }
);

test(
    'rejeita nova senha curta',
    function () {
        const validator = criarValidator();

        const resultado =
            validator.validarAlteracaoSenha({
                senhaAtual: 'senha atual',
                novaSenha: 'senha curta',
                confirmacaoNovaSenha:
                    'senha curta'
            });

        assert.equal(resultado.valido, false);
    }
);

test(
    'rejeita confirmação de senha diferente',
    function () {
        const validator = criarValidator();

        const resultado =
            validator.validarAlteracaoSenha({
                senhaAtual:
                    'senha atual',

                novaSenha:
                    'uma frase secreta longa',

                confirmacaoNovaSenha:
                    'outra frase secreta'
            });

        assert.equal(resultado.valido, false);

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo
                    === 'confirmacaoNovaSenha'
            ),
            true
        );
    }
);