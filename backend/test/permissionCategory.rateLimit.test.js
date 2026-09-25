//Testa o limite de criação sem registrar nomes ou permissões sensíveis.
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarPermissionCategoryRateLimit } from '../src/middlewares/rateLimit.middleware.js'

//Cria dependências controladas para inspecionar a configuração do limitador.
function criarDependencias() {
    const chamadas = {
        configuracoes: [],
        logs: []
    }

    function rateLimit(configuracoes) {
        chamadas.configuracoes.push(configuracoes)

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

//Cria uma resposta Express controlada.
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

test('configura o limite por titular autenticada', () => {
    const {rateLimit, logger, chamadas} = criarDependencias()

    const middleware = criarPermissionCategoryRateLimit({
        rateLimit,
        janelaMs: 900000,
        limite: 20,
        logger
    })

    assert.equal(middleware.tipo, 'middleware-rate-limit')
    assert.equal(chamadas.configuracoes.length, 1)

    const configuracoes = chamadas.configuracoes[0]

    assert.equal(configuracoes.windowMs, 900000)
    assert.equal(configuracoes.limit, 20)
    assert.equal(configuracoes.standardHeaders, true)
    assert.equal(configuracoes.legacyHeaders, false)

    assert.equal(
        configuracoes.keyGenerator({
            usuario: {
                id: 17
            }
        }),
        'usuario:17'
    )
})

test('retorna resposta segura ao exceder o limite', () => {
    const {rateLimit, logger, chamadas} = criarDependencias()

    criarPermissionCategoryRateLimit({
        rateLimit,
        janelaMs: 900000,
        limite: 20,
        logger
    })

    const req = {
        method: 'POST',
        originalUrl: '/support-network/permission-categories',
        usuario: {
            id: 17
        }
    }

    const res = criarResposta()

    chamadas.configuracoes[0].handler(req, res)

    assert.equal(res.statusCode, 429)

    assert.deepEqual(res.body, {
        erro: {
            codigo: 'LIMITE_CRIACAO_CATEGORIA',
            mensagem: 'Muitas tentativas de criação em pouco tempo. Aguarde alguns minutos e tente novamente.'
        }
    })
})

test('não registra nome nem permissões quando uma requisição é bloqueada', () => {
    const {rateLimit, logger, chamadas} = criarDependencias()

    criarPermissionCategoryRateLimit({
        rateLimit,
        janelaMs: 900000,
        limite: 20,
        logger
    })

    const req = {
        method: 'POST',
        originalUrl: '/support-network/permission-categories',
        usuario: {
            id: 17
        },
        body: {
            nome: 'Categoria privada',
            dadosVisiveis: [
                'vida_intima.atividade_sexual'
            ]
        }
    }

    chamadas.configuracoes[0].handler(req, criarResposta())

    assert.deepEqual(chamadas.logs, [
        {
            evento: 'limite_criacao_categoria_permissao',
            usuarioId: 17,
            metodo: 'POST',
            rota: '/support-network/permission-categories'
        }
    ])

    const logSerializado = JSON.stringify(chamadas.logs)

    assert.equal(logSerializado.includes('Categoria privada'), false)
    assert.equal(logSerializado.includes('vida_intima.atividade_sexual'), false)
})

test('não ignora criações bem-sucedidas no limite de segurança', () => {
    const {rateLimit, logger, chamadas} = criarDependencias()

    criarPermissionCategoryRateLimit({
        rateLimit,
        janelaMs: 900000,
        limite: 20,
        logger
    })

    assert.equal(chamadas.configuracoes[0].skipSuccessfulRequests, undefined)
})