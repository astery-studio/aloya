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
