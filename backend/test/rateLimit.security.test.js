//Este arquivo testa as configurações de proteção contra abuso das rotas de conta
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarConfiguracoesContaRateLimit, criarAlteracaoSenhaRateLimit } from '../src/middlewares/rateLimit.middleware.js'

//Captura as opções enviadas ao express-rate-limit
function criarRateLimitMock() {
    return function rateLimit(opcoes) {
        return opcoes
    }
}

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

//Confirma que o limite pertence à conta autenticada
test(
    'usa o id da usuária como chave do limite de configurações',
    function () {
        const limitador =
            criarConfiguracoesContaRateLimit({
                rateLimit:
                    criarRateLimitMock(),

                janelaMs: 900000,
                limite: 20
            })

        const chave =
            limitador.keyGenerator({
                usuario: {
                    id: 42
                }
            })

        assert.equal(
            chave,
            'usuario:42'
        )
    }
)

//Confirma que tentativas malsucedidas de senha são limitadas
test(
    'limita alteração de senha e ignora respostas bem-sucedidas',
    function () {
        const limitador =
            criarAlteracaoSenhaRateLimit({
                rateLimit:
                    criarRateLimitMock(),

                janelaMs: 900000,
                limite: 5
            })

        assert.equal(
            limitador.limit,
            5
        )

        assert.equal(
            limitador
                .skipSuccessfulRequests,
            true
        )
    }
)

//Garante que o log do bloqueio não contenha senha nem token
test(
    'não registra dados sensíveis no bloqueio de senha',
    function () {
        let registro = null

        const logger = {
            warn(dados) {
                registro = dados
            }
        }

        const limitador =
            criarAlteracaoSenhaRateLimit({
                rateLimit:
                    criarRateLimitMock(),

                janelaMs: 900000,
                limite: 5,
                logger
            })

        const req = {
            method: 'PATCH',
            originalUrl:
                '/users/me/password',

            usuario: {
                id: 1
            },

            body: {
                senhaAtual: 'segredo-atual',
                novaSenha: 'segredo-novo'
            },

            headers: {
                authorization:
                    'Bearer token-secreto'
            }
        }

        const res = criarRespostaMock()

        limitador.handler(req, res)

        const registroSerializado =
            JSON.stringify(registro)

        assert.equal(
            registroSerializado
                .includes('segredo-atual'),
            false
        )

        assert.equal(
            registroSerializado
                .includes('segredo-novo'),
            false
        )

        assert.equal(
            registroSerializado
                .includes('token-secreto'),
            false
        )

        assert.equal(
            res.statusRecebido,
            429
        )
    }
)