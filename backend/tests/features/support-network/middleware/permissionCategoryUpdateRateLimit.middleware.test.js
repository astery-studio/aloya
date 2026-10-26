import test from 'node:test'
import assert from 'node:assert/strict'

import {criarPermissionCategoryUpdateRateLimit} from '../../../../src/features/support-network/middleware/permissionCategoryUpdateRateLimit.middleware.js'

test('limita atualizações por titular sem registrar o corpo sensível', () => {
    let configuracao = null
    const logs = []
    const middleware = criarPermissionCategoryUpdateRateLimit({
        rateLimit(opcoes) {
            configuracao = opcoes
            return opcoes
        },
        janelaMs: 60_000,
        limite: 8,
        logger: {
            warn(evento) {
                logs.push(evento)
            }
        }
    })

    assert.equal(middleware, configuracao)
    assert.equal(configuracao.keyGenerator({usuario: {id: 7}}), 'usuario:7')

    const resposta = {
        statusCode: null,
        body: null,
        status(codigo) {
            this.statusCode = codigo
            return this
        },
        json(body) {
            this.body = body
            return this
        }
    }
    const req = {
        usuario: {id: 7},
        method: 'PUT',
        originalUrl: '/support-network/permission-categories/12',
        body: {nome: 'Categoria privada'}
    }

    configuracao.handler(req, resposta)

    assert.equal(resposta.statusCode, 429)
    assert.equal(resposta.body.erro.codigo, 'LIMITE_ATUALIZACAO_CATEGORIA')
    assert.equal(JSON.stringify(logs).includes('Categoria privada'), false)
})
