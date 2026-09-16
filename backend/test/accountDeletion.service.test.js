//Este arquivo testa autorização, senha, ordem de exclusão e falha fechada
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarAccountDeletionService } from '../src/services/accountDeletion.service.js'

//Cria uma conta principal e uma sessão ativa para os testes
function criarUsuario() {
    return {
        id: 1,
        email: 'titular@email.com',
        papel: 'principal',
        statusConta: 'ativa',
        senhaHash: 'hash-atual'
    }
}

//Cria um Prisma controlado sem tocar em dados reais
function criarPrismaMock() {
    const chamadas = []

    const prisma = {
        usuario: {
            async findUnique() {
                return criarUsuario()
            },

            async deleteMany(consulta) {
                chamadas.push([
                    'excluir_usuario',
                    consulta
                ])

                return {
                    count: 1
                }
            }
        },

        sessao: {
            async findFirst() {
                return {
                    id: 10
                }
            }
        },

        vinculoRedeApoio: {
            async findMany() {
                return [
                    {
                        id: 30
                    }
                ]
            },

            async deleteMany(consulta) {
                chamadas.push([
                    'excluir_vinculos',
                    consulta
                ])

                return {
                    count: 1
                }
            }
        },

        notificacao: {
            async deleteMany(consulta) {
                chamadas.push([
                    'excluir_notificacoes_orfas',
                    consulta
                ])

                return {
                    count: 1
                }
            }
        }
    }

    prisma.$transaction =
        async function executar(callback) {
            chamadas.push([
                'iniciar_transacao'
            ])

            return callback(prisma)
        }

    return {
        prisma,
        chamadas
    }
}

//Cria o service com senha e relógio previsíveis
function criarService({
    prisma,
    senhaCorreta = true
}) {
    return criarAccountDeletionService({
        prisma,

        passwordService: {
            async compararSenha() {
                return senhaCorreta
            }
        },

        now: () =>
            new Date(
                '2026-09-15T12:00:00.000Z'
            )
    })
}

//Cria os parâmetros da própria conta autenticada
function criarPedido(alteracoes = {}) {
    return {
        usuarioId: 1,
        sessaoId: 10,
        papel: 'principal',
        senhaAtual:
            'minha senha atual',

        ...alteracoes
    }
}

test(
    'senha incorreta não inicia a transação',
    async function () {
        const {
            prisma,
            chamadas
        } = criarPrismaMock()

        const service = criarService({
            prisma,
            senhaCorreta: false
        })

        await assert.rejects(
            service.excluirConta(
                criarPedido()
            ),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'SENHA_ATUAL_INCORRETA'
                )
            }
        )

        assert.equal(
            chamadas.length,
            0
        )
    }
)

test(
    'contato de apoio não pode excluir pela HU-005',
    async function () {
        const {
            prisma,
            chamadas
        } = criarPrismaMock()

        const service = criarService({
            prisma
        })

        await assert.rejects(
            service.excluirConta(
                criarPedido({
                    papel:
                        'contato_apoio'
                })
            ),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'EXCLUSAO_NAO_PERMITIDA'
                )
            }
        )

        assert.equal(
            chamadas.length,
            0
        )
    }
)

test(
    'exclui vínculos antes da conta e usa o hash vigente',
    async function () {
        const {
            prisma,
            chamadas
        } = criarPrismaMock()

        const service = criarService({
            prisma
        })

        const resultado =
            await service.excluirConta(
                criarPedido()
            )

        assert.deepEqual(
            chamadas.map(
                (item) =>
                    item[0]
            ),

            [
                'iniciar_transacao',
                'excluir_notificacoes_orfas',
                'excluir_vinculos',
                'excluir_usuario'
            ]
        )

        const consultaUsuario =
            chamadas.find(
                (item) =>
                    item[0]
                    === 'excluir_usuario'
            )[1]

        assert.deepEqual(
            consultaUsuario.where,
            {
                id: 1,
                senhaHash:
                    'hash-atual',
                statusConta:
                    'ativa'
            }
        )

        assert.equal(
            resultado.mensagem,
            'Sua conta foi excluída com sucesso.'
        )
    }
)

test(
    'sessão revogada impede qualquer exclusão',
    async function () {
        const {
            prisma,
            chamadas
        } = criarPrismaMock()

        prisma.sessao.findFirst =
            async function buscar() {
                return null
            }

        const service = criarService({
            prisma
        })

        await assert.rejects(
            service.excluirConta(
                criarPedido()
            ),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'SESSAO_INVALIDA'
                )
            }
        )

        assert.deepEqual(
            chamadas.map(
                (item) =>
                    item[0]
            ),

            [
                'iniciar_transacao'
            ]
        )
    }
)

test(
    'mudança concorrente da senha interrompe a transação',
    async function () {
        const {
            prisma
        } = criarPrismaMock()

        prisma.usuario.deleteMany =
            async function excluir() {
                return {
                    count: 0
                }
            }

        const service = criarService({
            prisma
        })

        await assert.rejects(
            service.excluirConta(
                criarPedido()
            ),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'CONTA_ALTERADA_CONCORRENTEMENTE'
                )
            }
        )
    }
)