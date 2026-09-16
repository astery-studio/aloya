//Este teste serve para testar o controller de conta, garantindo que as funcionalidades relacionadas à conta do usuário funcionem corretamente
import test from 'node:test'
import assert from 'node:assert/strict'
import {criarAccountController} from '../src/controllers/account.controller.js'

//Função para criar um mock de resposta HTTP
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

//Testes para o controller de conta
test(
    'retorna os dados cadastrados da própria conta',
    async function () {
        const accountController =
            criarAccountController({
                accountService: {
                    async buscarConfiguracoes() {
                        return {
                            id: 1,
                            nome: 'Aloya Teste',
                            email: 'aloya@email.com',
                            identidadeGenero:
                                'Mulher Cisgênero',
                            dataNascimento:
                                '2000-04-08'
                        }
                    }
                },

                accountValidator: {}
            })

        const req = {
            usuario: {
                id: 1
            }
        }

        const res = criarRespostaMock();

        await accountController
            .buscarConfiguracoes(
                req,
                res,
                assert.fail
            )

        assert.equal(res.statusRecebido, 200);
        assert.equal(
            res.corpoRecebido
                .configuracoes
                .email,
            'aloya@email.com'
        )
    }
)

//Teste para retornar erro de validação quando a atualização é inválida
test(
    'retorna 422 quando a atualização é inválida',
    async function () {
        const accountController =
            criarAccountController({
                accountService: {},

                accountValidator: {
                    validarAtualizacao() {
                        return {
                            valido: false,
                            erros: [
                                {
                                    campo: 'email',
                                    mensagem:
                                        'Informe um e-mail válido.'
                                }
                            ]
                        }
                    }
                }
            })

        const req = {
            body: {},
            usuario: {
                id: 1
            }
        }

        //Cria um mock de resposta HTTP
        const res = criarRespostaMock();

        await accountController
            .atualizarConfiguracoes(
                req,
                res,
                assert.fail
            )

        assert.equal(res.statusRecebido, 422)

        assert.equal(
            res.corpoRecebido.erro.codigo,
            'ERRO_VALIDACAO'
        )
    }
)