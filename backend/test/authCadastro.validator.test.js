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
