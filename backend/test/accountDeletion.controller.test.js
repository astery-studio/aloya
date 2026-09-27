//Este arquivo testa que o controller nunca exclui sem confirmação válida
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarAccountDeletionController } from '../src/controllers/accountDeletion.controller.js'

//Cria uma resposta HTTP controlada
function criarRespostaMock() {
    return {
        statusRecebido: null,
        corpoRecebido: null,

        status(status) {
            this.statusRecebido = status

            return this
        },

        json(corpo) {
            this.corpoRecebido = corpo

            return this
        }
    }
}

test(
    'cancelamento retorna 422 sem chamar o service',
    async function () {
        let serviceChamado = false

        const controller =
            criarAccountDeletionController({
                accountDeletionValidator: {
                    validarExclusao() {
                        return {
                            valido: false,

                            erros: [
                                {
                                    campo:
                                        'confirmarExclusao',

                                    mensagem:
                                        'Confirme a exclusão.'
                                }
                            ]
                        }
                    }
                },

                accountDeletionService: {
                    async excluirConta() {
                        serviceChamado = true
                    }
                }
            })

        const res =
            criarRespostaMock()

        await controller.excluirConta(
            {
                body: {
                    confirmarExclusao:
                        false
                },

                usuario: {
                    id: 1,
                    sessaoId: 10,
                    papel:
                        'principal'
                }
            },

            res,
            assert.fail
        )

        assert.equal(
            res.statusRecebido,
            422
        )

        assert.equal(
            serviceChamado,
            false
        )
    }
)

test(
    'usa somente a identidade obtida da sessão',
    async function () {
        let pedidoRecebido = null

        const controller =
            criarAccountDeletionController({
                accountDeletionValidator: {
                    validarExclusao() {
                        return {
                            valido: true,

                            dados: {
                                senhaAtual:
                                    'senha atual'
                            }
                        }
                    }
                },

                accountDeletionService: {
                    async excluirConta(pedido) {
                        pedidoRecebido =
                            pedido

                        return {
                            mensagem:
                                'Sua conta foi excluída com sucesso.'
                        }
                    }
                }
            })

        const res =
            criarRespostaMock()

        await controller.excluirConta(
            {
                body: {
                    usuarioId: 999,
                    senhaAtual:
                        'senha atual',

                    confirmarExclusao:
                        true
                },

                usuario: {
                    id: 1,
                    sessaoId: 10,
                    papel:
                        'principal'
                }
            },

            res,
            assert.fail
        )

        assert.deepEqual(
            pedidoRecebido,
            {
                usuarioId: 1,
                sessaoId: 10,
                papel: 'principal',
                senhaAtual:
                    'senha atual'
            }
        )

        assert.equal(
            res.statusRecebido,
            200
        )
    }
)