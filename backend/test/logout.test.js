//Testes de segurança do logout da sessão atual
import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'

import {criarLogoutService} from '../src/services/logout.service.js'
import {criarLogoutController} from '../src/controllers/logout.controller.js'
import {criarLogoutRoutes} from '../src/routes/logout.routes.js'
import {criarAuthMiddleware} from '../src/middlewares/auth.middleware.js'

test(
    'revoga apenas a sessão pertencente à pessoa autenticada',
    async function () {
        let consultaRecebida = null

        const service = criarLogoutService({
            prisma: {
                sessao: {
                    async updateMany(consulta) {
                        consultaRecebida = consulta

                        return {
                            count: 1
                        }
                    }
                }
            }
        })

        await service.encerrarSessao({
            usuarioId: 7,
            sessaoId: 19
        })

        assert.deepEqual(
            consultaRecebida.where,
            {
                id: 19,
                usuarioId: 7,
                revogadaEm: null
            }
        )

        assert.ok(
            consultaRecebida.data.revogadaEm
                instanceof Date
        )
    }
)

test(
    'não consulta o banco com ids ausentes ou inválidos',
    async function () {
        let bancoChamado = false

        const service = criarLogoutService({
            prisma: {
                sessao: {
                    async updateMany() {
                        bancoChamado = true

                        return {
                            count: 1
                        }
                    }
                }
            }
        })

        const pedidosInvalidos = [
            {
                usuarioId: undefined,
                sessaoId: 10
            },
            {
                usuarioId: 1,
                sessaoId: undefined
            },
            {
                usuarioId: 1,
                sessaoId: 0
            },
            {
                usuarioId: '1',
                sessaoId: 10
            }
        ]

        for (const pedido of pedidosInvalidos) {
            await assert.rejects(
                service.encerrarSessao(pedido),
                {
                    status: 401,
                    codigo: 'SESSAO_INVALIDA'
                }
            )
        }

        assert.equal(
            bancoChamado,
            false
        )
    }
)

test(
    'não informa sucesso quando nenhuma sessão foi revogada',
    async function () {
        const service = criarLogoutService({
            prisma: {
                sessao: {
                    async updateMany() {
                        return {
                            count: 0
                        }
                    }
                }
            }
        })

        await assert.rejects(
            service.encerrarSessao({
                usuarioId: 1,
                sessaoId: 10
            }),
            {
                status: 401,
                codigo: 'SESSAO_INVALIDA'
            }
        )
    }
)

test(
    'não informa sucesso quando o banco falha',
    async function () {
        const erroBanco = new Error(
            'Falha simulada no banco'
        )

        const service = criarLogoutService({
            prisma: {
                sessao: {
                    async updateMany() {
                        throw erroBanco
                    }
                }
            }
        })

        await assert.rejects(
            service.encerrarSessao({
                usuarioId: 1,
                sessaoId: 10
            }),
            function (erro) {
                return erro === erroBanco
            }
        )
    }
)

test(
    'controller ignora qualquer usuarioId enviado no corpo',
    async function () {
        let pedidoRecebido = null

        const controller = criarLogoutController({
            logoutService: {
                async encerrarSessao(pedido) {
                    pedidoRecebido = pedido
                }
            }
        })

        const resposta = {
            statusRecebido: null,
            cabecalhos: {},
            enviada: false,

            set(nome, valor) {
                this.cabecalhos[nome] = valor

                return this
            },

            status(valor) {
                this.statusRecebido = valor

                return this
            },

            send() {
                this.enviada = true

                return this
            }
        }

        await controller.encerrarSessao(
            {
                body: {
                    usuarioId: 999,
                    sessaoId: 999
                },

                usuario: {
                    id: 1,
                    sessaoId: 10
                }
            },

            resposta,
            assert.fail
        )

        assert.deepEqual(
            pedidoRecebido,
            {
                usuarioId: 1,
                sessaoId: 10
            }
        )

        assert.equal(
            resposta.statusRecebido,
            204
        )

        assert.equal(
            resposta.cabecalhos['Cache-Control'],
            'no-store'
        )

        assert.equal(
            resposta.enviada,
            true
        )
    }
)

test(
    'rota exige autenticação antes do controller',
    function () {
        let rotaRegistrada = null

        function autenticar() {}
        function encerrarSessao() {}

        const router = {
            post(...argumentos) {
                rotaRegistrada = argumentos
            }
        }

        criarLogoutRoutes({
            Router() {
                return router
            },

            authMiddleware: {
                autenticar
            },

            logoutController: {
                encerrarSessao
            }
        })

        assert.deepEqual(
            rotaRegistrada,
            [
                '/logout',
                autenticar,
                encerrarSessao
            ]
        )
    }
)

test(
    'após o logout o token antigo falha, mas outra sessão continua ativa',
    async function () {
        const validade = new Date(
            '2100-01-01T00:00:00.000Z'
        )

        const sessoes = [
            {
                id: 10,
                usuarioId: 1,
                tokenSessaoHash: 'hash-token-atual',
                validadeSessao: validade,
                revogadaEm: null
            },
            {
                id: 11,
                usuarioId: 1,
                tokenSessaoHash: 'hash-token-outro',
                validadeSessao: validade,
                revogadaEm: null
            }
        ]

        const prisma = {
            sessao: {
                async findFirst(consulta) {
                    const sessao = sessoes.find(
                        function (item) {
                            return (
                                item.usuarioId ===
                                    consulta.where.usuarioId &&
                                item.tokenSessaoHash ===
                                    consulta.where.tokenSessaoHash &&
                                item.revogadaEm === null &&
                                item.validadeSessao >
                                    consulta.where.validadeSessao.gt
                            )
                        }
                    )

                    if (!sessao) {
                        return null
                    }

                    return {
                        id: sessao.id,

                        usuario: {
                            id: 1,
                            papel: 'principal',
                            statusConta: 'ativa'
                        }
                    }
                },

                async updateMany(consulta) {
                    const sessao = sessoes.find(
                        function (item) {
                            return (
                                item.id ===
                                    consulta.where.id &&
                                item.usuarioId ===
                                    consulta.where.usuarioId &&
                                item.revogadaEm === null
                            )
                        }
                    )

                    if (!sessao) {
                        return {
                            count: 0
                        }
                    }

                    sessao.revogadaEm =
                        consulta.data.revogadaEm

                    return {
                        count: 1
                    }
                }
            }
        }

        const tokenService = {
            validarTokenSessao(token) {
                if (
                    token !== 'token-atual' &&
                    token !== 'token-outro'
                ) {
                    const erro = new Error(
                        'Token inválido'
                    )

                    erro.name =
                        'JsonWebTokenError'

                    throw erro
                }

                return {
                    usuarioId: 1
                }
            },

            gerarHashToken(token) {
                return `hash-${token}`
            }
        }

        const authMiddleware =
            criarAuthMiddleware({
                tokenService,
                prisma
            })

        const logoutService =
            criarLogoutService({
                prisma
            })

        const logoutController =
            criarLogoutController({
                logoutService
            })

        const app = express()

        app.use(
            '/auth',
            criarLogoutRoutes({
                Router: express.Router,
                authMiddleware,
                logoutController
            })
        )

        app.get(
            '/protegida',
            authMiddleware.autenticar,

            function (_req, res) {
                return res.sendStatus(200)
            }
        )

        //Respostas previsíveis para os erros simulados neste teste.
        app.use(
            function (
                erro,
                _req,
                res,
                _next
            ) {
                return res.status(
                    erro.status || 500
                ).json({
                    erro: {
                        codigo:
                            erro.codigo ||
                            'ERRO_INTERNO'
                    }
                })
            }
        )

        const servidor = app.listen(
            0,
            '127.0.0.1'
        )

        await new Promise(
            function (resolve) {
                servidor.once(
                    'listening',
                    resolve
                )
            }
        )

        const endereco =
            `http://127.0.0.1:${servidor.address().port}`

        try {
            const semToken = await fetch(
                `${endereco}/auth/logout`,
                {
                    method: 'POST'
                }
            )

            assert.equal(
                semToken.status,
                401
            )

            const logout = await fetch(
                `${endereco}/auth/logout`,
                {
                    method: 'POST',

                    headers: {
                        Authorization:
                            'Bearer token-atual'
                    }
                }
            )

            assert.equal(
                logout.status,
                204
            )

            assert.ok(
                sessoes[0].revogadaEm
                    instanceof Date
            )

            assert.equal(
                sessoes[1].revogadaEm,
                null
            )

            const acessoAntigo = await fetch(
                `${endereco}/protegida`,
                {
                    headers: {
                        Authorization:
                            'Bearer token-atual'
                    }
                }
            )

            assert.equal(
                acessoAntigo.status,
                401
            )

            const outroDispositivo = await fetch(
                `${endereco}/protegida`,
                {
                    headers: {
                        Authorization:
                            'Bearer token-outro'
                    }
                }
            )

            assert.equal(
                outroDispositivo.status,
                200
            )
        } finally {
            await new Promise(
                function (resolve, reject) {
                    servidor.close(
                        function (erro) {
                            if (erro) {
                                reject(erro)
                                return
                            }

                            resolve()
                        }
                    )
                }
            )
        }
    }
)