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
    };

    const usuarioCriado = {
        id: 1,
        nome: 'Carla Cristina',
        email: 'carla@email.com',
        papel: 'principal',
        statusConta: 'ativa'
    };

    const tx = {
        usuario: {
            async create(argumentos) {
                chamadas.criarUsuario.push(
                    argumentos
                );

                return usuarioCriado;
            }
        },

        sessao: {
            async create(argumentos) {
                chamadas.criarSessao.push(
                    argumentos
                );

                return {
                    id: 10,
                    ...argumentos.data
                };
            }
        }
    };

    const prisma = {
        usuario: {
            async findUnique(argumentos) {
                chamadas.buscarUsuario.push(
                    argumentos
                );

                return usuarioExistente;
            }
        },
