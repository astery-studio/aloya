//Este arquivo testa se as configurações da conta só podem ser acessadas por uma sessão válida
const test = require('node:test')
const assert = require('node:assert/strict')

const { criarAuthMiddleware } = require('../src/middlewares/auth.middleware')

//Executa o middleware e captura o valor enviado para next
async function executarMiddleware({
    cabecalho,
    tokenService,
    sessao
}) {
    let erroRecebido = null
    let quantidadeNext = 0
    let consultaRecebida = null

    const prisma = {
        sessao: {
            async findFirst(consulta) {
                consultaRecebida = consulta

                return sessao
            }
        }
    }

    const authMiddleware =
        criarAuthMiddleware({
            tokenService,
            prisma
        })

    const req = {
        headers: {}
    }

    if (cabecalho !== undefined) {
        req.headers.authorization =
            cabecalho
    }

    await authMiddleware.autenticar(
        req,
        {},

        function next(erro) {
            quantidadeNext += 1
            erroRecebido = erro || null
        }
    )

    return {
        req,
        erroRecebido,
        quantidadeNext,
        consultaRecebida
    }
}

//Cria um token service válido para os testes
function criarTokenServiceValido() {
    return {
        validarTokenSessao() {
            return {
                usuarioId: 1
            }
        },

        gerarHashToken() {
            return 'hash-seguro-do-token'
        }
    }
}

//Rejeita requisições sem autenticação
test(
    'rejeita requisição sem Bearer token',
    async function () {
        const resultado =
            await executarMiddleware({
                tokenService:
                    criarTokenServiceValido(),

                sessao: null
            })

        assert.equal(
            resultado.erroRecebido.codigo,
            'NAO_AUTENTICADO'
        )

        assert.equal(
            resultado.quantidadeNext,
            1
        )
    }
)

//Rejeita cabeçalho Bearer sem token
test(
    'rejeita cabeçalho Bearer vazio',
    async function () {
        const resultado =
            await executarMiddleware({
                cabecalho: 'Bearer ',

                tokenService:
                    criarTokenServiceValido(),

                sessao: null
            })

        assert.equal(
            resultado.erroRecebido.codigo,
            'TOKEN_INVALIDO'
        )
    }
)

//Padroniza erros do JWT sem expor detalhes internos
test(
    'rejeita JWT inválido com resposta controlada',
    async function () {
        const tokenService = {
            validarTokenSessao() {
                const erro = new Error(
                    'assinatura interna inválida'
                )

                erro.name =
                    'JsonWebTokenError'

                throw erro
            },

            gerarHashToken() {
                assert.fail(
                    'Não deveria gerar hash para token inválido.'
                )
            }
        }

        const resultado =
            await executarMiddleware({
                cabecalho:
                    'Bearer token-invalido',

                tokenService,
                sessao: null
            })

        assert.equal(
            resultado.erroRecebido.codigo,
            'TOKEN_INVALIDO'
        )

        assert.equal(
            resultado.erroRecebido.status,
            401
        )
    }
)

//Rejeita token válido que não possui sessão ativa no banco
test(
    'rejeita sessão revogada ou inexistente',
    async function () {
        const resultado =
            await executarMiddleware({
                cabecalho:
                    'Bearer token-valido',

                tokenService:
                    criarTokenServiceValido(),

                sessao: null
            })

        assert.equal(
            resultado.erroRecebido.codigo,
            'SESSAO_INVALIDA'
        )
    }
)

//Rejeita sessão pertencente a uma conta desativada
test(
    'rejeita conta que não está ativa',
    async function () {
        const resultado =
            await executarMiddleware({
                cabecalho:
                    'Bearer token-valido',

                tokenService:
                    criarTokenServiceValido(),

                sessao: {
                    id: 10,

                    usuario: {
                        id: 1,
                        papel: 'titular',
                        statusConta: 'suspensa'
                    }
                }
            })

        assert.equal(
            resultado.erroRecebido.codigo,
            'SESSAO_INVALIDA'
        )
    }
)

//Disponibiliza somente os dados mínimos da sessão autenticada
test(
    'aceita sessão ativa sem expor o token',
    async function () {
        const resultado =
            await executarMiddleware({
                cabecalho:
                    'Bearer token-secreto',

                tokenService:
                    criarTokenServiceValido(),

                sessao: {
                    id: 10,

                    usuario: {
                        id: 1,
                        papel: 'titular',
                        statusConta: 'ativa'
                    }
                }
            })

        assert.equal(
            resultado.erroRecebido,
            null
        )

        assert.deepEqual(
            resultado.req.usuario,
            {
                id: 1,
                papel: 'titular',
                sessaoId: 10
            }
        )

        assert.equal(
            resultado
                .consultaRecebida
                .where
                .tokenSessaoHash,
            'hash-seguro-do-token'
        )

        assert.equal(
            JSON.stringify(
                resultado.consultaRecebida
            ).includes('token-secreto'),
            false
        )
    }
)