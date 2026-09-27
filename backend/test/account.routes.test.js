//Testa se todas as rotas de configurações e conta estão protegidas e usam os middlewares corretos.
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarAccountRoutes } from '../src/routes/account.routes.js'

//Confirma a autenticação e a configuração exata de todas as rotas de conta.
test(
    'protege todas as rotas com autenticação',
    function () {
        const chamadas = []

        //Simula somente os métodos do Express utilizados pelas rotas de conta.
        const router = {
            use(...argumentos) {
                chamadas.push([
                    'use',
                    ...argumentos
                ])
            },

            get(...argumentos) {
                chamadas.push([
                    'get',
                    ...argumentos
                ])
            },

            post(...argumentos) {
                chamadas.push([
                    'post',
                    ...argumentos
                ])
            },

            patch(...argumentos) {
                chamadas.push([
                    'patch',
                    ...argumentos
                ])
            },

            delete(...argumentos) {
                chamadas.push([
                    'delete',
                    ...argumentos
                ])
            }
        }

        function autenticar() {}
        function buscarConfiguracoes() {}
        function atualizarConfiguracoes() {}
        function alterarSenha() {}
        function confirmarSenhaExclusao() {}
        function excluirConta() {}
        function limiteConfiguracoes() {}
        function limiteSenha() {}
        function limiteExclusao() {}

        criarAccountRoutes({
            Router: function criarRouterMock() {
                return router
            },

            accountController: {
                buscarConfiguracoes,
                atualizarConfiguracoes,
                alterarSenha
            },

            authMiddleware: {
                autenticar
            },

            configuracoesContaRateLimit:
                limiteConfiguracoes,

            alteracaoSenhaRateLimit:
                limiteSenha,

            accountDeletionController: {
                confirmarSenhaExclusao,
                excluirConta
            },

            exclusaoContaRateLimit:
                limiteExclusao
        })

        //A autenticação precisa ser registrada antes de qualquer endpoint.
        assert.deepEqual(
            chamadas[0],
            [
                'use',
                autenticar
            ]
        )

        //Confere todos os endpoints, controllers e limites registrados no router.
        assert.deepEqual(
            chamadas,
            [
                [
                    'use',
                    autenticar
                ],

                [
                    'get',
                    '/me',
                    buscarConfiguracoes
                ],

                [
                    'patch',
                    '/me',
                    limiteConfiguracoes,
                    atualizarConfiguracoes
                ],

                [
                    'patch',
                    '/me/password',
                    limiteSenha,
                    alterarSenha
                ],

                [
                    'delete',
                    '/me',
                    limiteExclusao,
                    excluirConta
                ],

                [
                    'post',
                    '/me/account-deletion/verify-password',
                    limiteExclusao,
                    confirmarSenhaExclusao
                ]
            ]
        )
    }
)