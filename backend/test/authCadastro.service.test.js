const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarAuthService
} = require('../src/services/auth.service');

function criarDadosValidos(alteracoes = {}) {
    return {
        nome: 'Carla Cristina',

        dataNascimento:
            new Date('2000-05-13T00:00:00.000Z'),

        email: 'carla@email.com',
        senha: 'senha-segura',

        dataInicioUltimaMenstruacao:
            new Date('2026-01-10T00:00:00.000Z'),

        dataFimUltimaMenstruacao:
            new Date('2026-01-14T00:00:00.000Z'),

        duracaoCicloInformada: 28,
        duracaoMenstruacaoInformada: 5,
        duracaoLuteaInformada: 14,
        menorDe16: false,
        emailResponsavelLegal: null,
        ...alteracoes
    };
}

function criarDependencias({
    usuarioExistente = null,
    falharEnvioEmail = false
} = {}) {
    const chamadas = {
        buscarUsuario: [],
        gerarHash: [],
        criarUsuario: [],
        gerarTokenSessao: [],
        criarSessao: [],
        criarConsentimentoPendente: [],
        enviarEmailConsentimento: [],
        logs: []
