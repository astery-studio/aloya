/**
 * Testa a configuração e a resposta segura do limitador de categorias.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import {
    criarPermissionCategoryRateLimit
} from '../../../../src/features/support-network/middleware/permissionCategoryRateLimit.middleware.js'

function criarDependencias() {
    const chamadas = {
        configuracoes: [],
        logs: []
    }

    function rateLimit(configuracoes) {
        chamadas.configuracoes.push(
            configuracoes
        )

        return {
            tipo: 'middleware-rate-limit',
            configuracoes
        }
    }

    const logger = {
        warn(conteudo) {
            chamadas.logs.push(conteudo)
        }
    }

    return {
        rateLimit,
        logger,
        chamadas
    }
}

function criarResposta() {
    return {
        statusCode: null,
        body: null,

        status(codigo) {
            this.statusCode = codigo
            return this
        },

        json(conteudo) {
            this.body = conteudo
            return this
        }
    }
}

test(
    'configura o limite de categorias por pessoa autenticada',
    () => {
        const {
            rateLimit,
            logger,
            chamadas
        } = criarDependencias()

        const middleware =
            criarPermissionCategoryRateLimit({
                rateLimit,
                janelaMs: 900000,
                limite: 20,
                logger
            })

        assert.equal(
            middleware.tipo,
            'middleware-rate-limit'
        )

        assert.equal(
            chamadas.configuracoes.length,
            1
        )

        const configuracoes =
            chamadas.configuracoes[0]

        assert.equal(
            configuracoes.windowMs,
            900000
        )

        assert.equal(
            configuracoes.limit,
            20
        )

        assert.equal(
            configuracoes.standardHeaders,
            true
        )

        assert.equal(
            configuracoes.legacyHeaders,
            false
        )

        assert.equal(
            configuracoes.keyGenerator({
                usuario: {
                    id: 42
                }
            }),
            'usuario:42'
        )

        assert.equal(
            typeof configuracoes.handler,
            'function'
        )
    }
)

test(
    'retorna HTTP 429 com código específico para categorias',
    () => {
        const {
            rateLimit,
            logger,
            chamadas
        } = criarDependencias()

        criarPermissionCategoryRateLimit({
            rateLimit,
            janelaMs: 900000,
            limite: 20,
            logger
        })

        const req = {
            usuario: {
                id: 42
            },
            method: 'POST',
            originalUrl:
                '/support-network/permission-categories'
        }

        const res = criarResposta()

        chamadas.configuracoes[0]
            .handler(req, res)

        assert.equal(
            res.statusCode,
            429
        )

        assert.deepEqual(
            res.body,
            {
                erro: {
                    codigo:
                        'LIMITE_CRIACAO_CATEGORIA',
                    mensagem:
                        'Muitas tentativas de criação de categoria. Aguarde alguns minutos e tente novamente.'
                }
            }
        )
    }
)

test(
    'registra o bloqueio sem expor os dados da categoria',
    () => {
        const {
            rateLimit,
            logger,
            chamadas
        } = criarDependencias()

        criarPermissionCategoryRateLimit({
            rateLimit,
            janelaMs: 900000,
            limite: 20,
            logger
        })

        const req = {
            usuario: {
                id: 42
            },
            method: 'POST',
            originalUrl:
                '/support-network/permission-categories',
            body: {
                nome: 'Família',
                dadosVisiveis: [
                    'geral.fase_atual'
                ]
            },
            headers: {
                authorization:
                    'Bearer token-privado'
            }
        }

        const res = criarResposta()

        chamadas.configuracoes[0]
            .handler(req, res)

        assert.deepEqual(
            chamadas.logs,
            [
                {
                    evento:
                        'limite_criacao_categoria_permissao',
                    usuarioId: 42,
                    metodo: 'POST',
                    rota:
                        '/support-network/permission-categories'
                }
            ]
        )

        const logSerializado =
            JSON.stringify(chamadas.logs)

        assert.equal(
            logSerializado.includes('Família'),
            false
        )

        assert.equal(
            logSerializado.includes(
                'geral.fase_atual'
            ),
            false
        )

        assert.equal(
            logSerializado.includes(
                'token-privado'
            ),
            false
        )
    }
)
