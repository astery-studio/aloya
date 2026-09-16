//Este arquivo registra proteções críticas que ainda precisam ser implementadas no service de conta
import test from 'node:test'
import assert from 'node:assert/strict'
import { criarAccountService } from '../src/services/account.service.js'

const dateUtils = require('../src/utils/date.utils')

//Cria uma usuária autenticada para os testes
function criarUsuario() {
    return {
        id: 1,
        nome: 'Aloya Teste',
        email: 'aloya@email.com',
        genero: 'Mulher Cisgênero',
        senhaHash: 'hash-atual',

        dataNascimento:
            new Date('2000-04-08T00:00:00.000Z'),

        atualizadoEm:
            new Date('2026-09-14T12:00:00.000Z')
    }
}

//Cria um Prisma controlado para testar regras de segurança ainda pendentes
function criarPrismaMock() {
    const usuario = criarUsuario()

    const prisma = {
        usuario: {
            async findUnique({ where }) {
                if (where.id === 1) {
                    return usuario
                }

                if (where.email) {
                    return null
                }

                return null
            },

            async update({ data }) {
                return {
                    ...usuario,
                    ...data
                }
            },

            async updateMany() {
                return {
                    count: 0
                }
            }
        },

        sessao: {
            async updateMany() {
                return {
                    count: 0
                }
            }
        },

        recuperacaoSenha: {
            async updateMany() {
                return {
                    count: 0
                }
            }
        }
    }

    prisma.$transaction =
        async function executar(callback) {
            return callback(prisma)
        }

    return prisma
}

//Cria o service com data previsível
function criarService({
    prisma,
    passwordService
}) {
    return criarAccountService({
        prisma,
        passwordService,

        parentalConsentService: {
            async reativarAposCorrecaoNascimento() {}
        },

        dateUtils,

        now: () =>
            new Date(
                '2026-09-14T12:00:00.000Z'
            )
    })
}

//A alteração de senha só pode preservar uma sessão conhecida e autenticada
test(
    'rejeita alteração de senha sem o id da sessão atual',
    async function () {
        const prisma =
            criarPrismaMock()

        const passwordService = {
            async compararSenha() {
                return true
            },

            async gerarHash() {
                return {
                    senhaHash: 'novo-hash'
                }
            }
        }

        const service = criarService({
            prisma,
            passwordService
        })

        await assert.rejects(
            service.alterarSenha({
                usuarioId: 1,
                sessaoId: undefined,
                senhaAtual: 'senha atual',
                novaSenha:
                    'Girassol violeta janela 2026'
            }),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'SESSAO_ATUAL_INVALIDA'
                    && erro.status === 401
                )
            }
        )
    }
)

//Impede que duas requisições concorrentes sobrescrevam a senha uma da outra
test(
    'rejeita alteração concorrente quando o hash anterior já mudou',
    async function () {
        const prisma =
            criarPrismaMock()

        let atualizacaoDiretaExecutada =
            false

        prisma.usuario.update =
            async function atualizar() {
                atualizacaoDiretaExecutada =
                    true

                return criarUsuario()
            }

        prisma.usuario.updateMany =
            async function atualizarSeHashConfere() {
                return {
                    count: 0
                }
            }

        let quantidadeComparacoes = 0

        const passwordService = {
            async compararSenha() {
                quantidadeComparacoes += 1

                return quantidadeComparacoes === 1
            },

            async gerarHash() {
                return {
                    senhaHash: 'novo-hash'
                }
            }
        }

        const service = criarService({
            prisma,
            passwordService
        })

        await assert.rejects(
            service.alterarSenha({
                usuarioId: 1,
                sessaoId: 10,
                senhaAtual: 'senha atual',
                novaSenha:
                    'Girassol violeta janela 2026'
            }),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'SENHA_ALTERADA_CONCORRENTEMENTE'
                    && erro.status === 409
                )
            }
        )

        assert.equal(
            atualizacaoDiretaExecutada,
            false
        )
    }
)