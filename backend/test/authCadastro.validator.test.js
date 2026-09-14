const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarAuthValidator
} = require('../src/validators/auth.validator');

const dateUtils =
    require('../src/utils/date.utils');

function criarDadosValidos(alteracoes = {}) {
    return {
        nome: 'Carla Cristina',
        dataNascimento: '2000-05-13',
        email: 'carla@email.com',
        senha: 'senha-segura',
        dataInicioUltimaMenstruacao: '2026-01-10',
        dataFimUltimaMenstruacao: '2026-01-14',
        duracaoCicloInformada: 28,
        duracaoMenstruacaoInformada: 5,
        duracaoLuteaInformada: 14,
        ...alteracoes
    };
}

function criarValidator() {
    return criarAuthValidator({
        dateUtils
    });
}

test(
    'aceita cadastro válido e normaliza nome e e-mail',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    nome: '  Carla   Cristina  ',
                    email: '  CARLA@EMAIL.COM  '
                })
            );

        assert.equal(resultado.valido, true);
        assert.deepEqual(resultado.erros, []);

        assert.equal(
            resultado.dados.nome,
            'Carla Cristina'
        );

        assert.equal(
            resultado.dados.email,
            'carla@email.com'
        );

        assert.equal(
            resultado.dados.menorDe16,
            false
        );

        assert.equal(
            resultado.dados.emailResponsavelLegal,
            null
        );

        assert.equal(
            resultado.dados.dataNascimento
                instanceof Date,
            true
        );

        assert.equal(
            resultado.dados
                .dataInicioUltimaMenstruacao
                instanceof Date,
            true
        );
    }
);

test(
    'permite cadastro sem os parâmetros opcionais do ciclo',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    dataFimUltimaMenstruacao:
                        undefined,

                    duracaoCicloInformada:
                        undefined,

                    duracaoMenstruacaoInformada:
                        undefined,

                    duracaoLuteaInformada:
                        undefined
                })
            );

        assert.equal(resultado.valido, true);
        assert.deepEqual(resultado.erros, []);

        assert.equal(
            resultado.dados
                .dataFimUltimaMenstruacao,
            null
        );

        assert.equal(
            resultado.dados
                .duracaoCicloInformada,
            null
        );

        assert.equal(
            resultado.dados
                .duracaoMenstruacaoInformada,
            null
        );

        assert.equal(
            resultado.dados
                .duracaoLuteaInformada,
            null
        );
    }
);

test(
    'identifica menor de 16 anos e normaliza o e-mail do responsável',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    dataNascimento: '2015-05-13',

                    emailResponsavelLegal:
                        '  RESPONSAVEL@EMAIL.COM  '
                })
            );

        assert.equal(resultado.valido, true);

        assert.equal(
            resultado.dados.menorDe16,
            true
        );

        assert.equal(
            resultado.dados
                .emailResponsavelLegal,
            'responsavel@email.com'
        );
    }
);

test(
    'permite que menor conclua o cadastro sem e-mail do responsável',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    dataNascimento: '2015-05-13',
                    emailResponsavelLegal: ''
                })
            );

        assert.equal(resultado.valido, true);

        assert.equal(
            resultado.dados.menorDe16,
            true
        );

        assert.equal(
            resultado.dados
                .emailResponsavelLegal,
            null
        );
    }
);

test(
    'rejeita o e-mail do responsável igual ao e-mail do titular',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    dataNascimento: '2015-05-13',

                    email:
                        'TITULAR@EMAIL.COM',

                    emailResponsavelLegal:
                        ' titular@email.com '
                })
            );

        assert.equal(resultado.valido, false);

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo ===
                        'emailResponsavelLegal' &&
                    item.mensagem ===
                        'O e-mail do responsável deve ser diferente do seu e-mail de cadastro.'
            ),
            true
        );
    }
);

test(
    'rejeita duração da menstruação maior ou igual à duração do ciclo',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    duracaoCicloInformada: 28,
                    duracaoMenstruacaoInformada: 28
                })
            );

        assert.equal(resultado.valido, false);

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo ===
                        'duracaoMenstruacaoInformada' &&
                    item.mensagem ===
                        'A duração da menstruação deve ser menor que a duração do ciclo.'
            ),
            true
        );
    }
);

test(
    'rejeita duração da fase lútea incompatível com o ciclo',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    duracaoCicloInformada: 20,
                    duracaoMenstruacaoInformada: 5,
                    duracaoLuteaInformada: 14
                })
            );

        assert.equal(resultado.valido, false);

        assert.equal(
            resultado.erros.some(
