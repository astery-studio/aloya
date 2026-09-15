//Este teste serve para testar as rotas de conta, garantindo que todas as rotas estejam protegidas por autenticação
const test = require('node:test')
const assert = require('node:assert/strict')

const { criarAccountRoutes } = require('../routes/account.routes')

//Testes para as rotas de conta
test(
    'protege todas as rotas com autenticação',
    function () {
        const chamadas = []

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

            patch(...argumentos) {
                chamadas.push([
                    'patch',
                    ...argumentos
                ])
            }
        }

        function autenticar() {}
        function buscarConfiguracoes() {}
        function atualizarConfiguracoes() {}
        function alterarSenha() {}
        function limiteConfiguracoes() {}
        function limiteSenha() {}

        try {
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
                    limiteSenha
            })
        }

        assert.equal(
            chamadas[0][0],
            'use'
        )

        assert.equal(
            chamadas[0][1],
            autenticar
        )

        assert.deepEqual(
            chamadas
                .filter(
                    (item) =>
                        item[0] === 'patch'
                )
                .map((item) => item[1]),
            [
                '/me',
                '/me/password'
            ]
        )
    }
)