//Testa as proteções integradas da criação de categorias de permissão.
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarPermissionCategoryValidator } from '../src/validators/permissionCategory.validator.js'
import { criarPermissionCategoryController } from '../src/controllers/permissionCategory.controller.js'
import { criarParentalConsentMiddleware } from '../src/middlewares/parentalConsent.middleware.js'
import { tratarErros } from '../src/middlewares/error.middleware.js'

const validator = criarPermissionCategoryValidator()

//Cria uma resposta Express controlada para testar erros públicos.
function criarRespostaMock() {
    return {
        statusCode: null,
        body: null,
        headers: {},

        set(nome, valor) {
            this.headers[nome] = valor

            return this
        },

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

test('normaliza letras maiúsculas e diferentes representações Unicode igualmente', () => {
    const primeira = validator.validarCriacaoCategoria({
        nome: 'Família',
        dadosVisiveis: ['geral.fase_atual']
    })

    const segunda = validator.validarCriacaoCategoria({
        nome: '  FAMI\u0301LIA  ',
        dadosVisiveis: ['geral.fase_atual']
    })

    assert.equal(primeira.valido, true)
    assert.equal(segunda.valido, true)
    assert.equal(primeira.dados.nomeNormalizado, 'família')
    assert.equal(segunda.dados.nomeNormalizado, 'família')
})

test('rejeita estruturas malformadas e seleções excessivamente grandes', () => {
    const selecoesInvalidas = [
        null,
        {},
        'geral.fase_atual',
        [['geral.fase_atual']],
        [null],
        Array(30).fill('geral.fase_atual')
    ]

    for (const dadosVisiveis of selecoesInvalidas) {
        const resultado = validator.validarCriacaoCategoria({
            nome: 'Família',
            dadosVisiveis
        })

        assert.equal(resultado.valido, false)
        assert.equal(resultado.erros.some(erro => erro.campo === 'dadosVisiveis'), true)
    }
})

test('bloqueia titular menor de 16 anos sem consentimento válido', async () => {
    const middleware = criarParentalConsentMiddleware({
        parentalConsentService: {
            async verificarAcessoRedeApoio() {
                return {
                    acessoLiberado: false,
                    motivo: 'CONSENTIMENTO_NECESSARIO',
                    consentimentoNecessario: true,
                    statusConsentimento: 'pendente'
                }
            }
        }
    })

    let erroRecebido = null

    await middleware.exigirAcessoRedeApoio(
        {
            usuario: {
                id: 15
            }
        },
        {},
        erro => {
            erroRecebido = erro
        }
    )

    assert.equal(erroRecebido.status, 403)
    assert.equal(erroRecebido.codigo, 'REDE_APOIO_BLOQUEADA')
    assert.equal(erroRecebido.message, 'O acesso à Rede de Apoio depende da autorização de um responsável legal.')
})

test('libera titular com acesso válido à Rede de Apoio', async () => {
    const middleware = criarParentalConsentMiddleware({
        parentalConsentService: {
            async verificarAcessoRedeApoio() {
                return {
                    acessoLiberado: true,
                    motivo: 'MAIOR_DE_16_ANOS',
                    consentimentoNecessario: false
                }
            }
        }
    })

    const chamadas = []

    await middleware.exigirAcessoRedeApoio(
        {
            usuario: {
                id: 20
            }
        },
        {},
        erro => {
            chamadas.push(erro)
        }
    )

    assert.deepEqual(chamadas, [undefined])
})

test('não expõe detalhes internos quando o banco falha', async () => {
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: validator,
        permissionCategoryService: {
            async criarCategoria() {
                throw new Error('SQLITE_BUSY: caminho privado do banco')
            }
        }
    })

    const req = {
        body: {
            nome: 'Família',
            dadosVisiveis: ['geral.fase_atual']
        },
        usuario: {
            id: 7,
            papel: 'principal'
        }
    }

    const res = criarRespostaMock()
    const consoleErrorOriginal = console.error

    console.error = () => {}

    try {
        await controller.criarCategoria(
            req,
            res,
            erro => tratarErros(erro, req, res, () => {})
        )
    } finally {
        console.error = consoleErrorOriginal
    }

    assert.equal(res.statusCode, 500)

    assert.deepEqual(res.body, {
        erro: {
            codigo: 'ERRO_INTERNO',
            mensagem: 'Ocorreu um erro ao criar sua categoria. Verifique sua conexão e tente novamente.'
        }
    })

    const respostaSerializada = JSON.stringify(res.body)

    assert.equal(respostaSerializada.includes('SQLITE_BUSY'), false)
    assert.equal(respostaSerializada.includes('caminho privado'), false)
})

test('a resposta interna não contém o corpo sensível enviado pela usuária', async () => {
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: validator,
        permissionCategoryService: {
            async criarCategoria() {
                throw new Error('Falha interna')
            }
        }
    })

    const req = {
        body: {
            nome: 'Categoria extremamente privada',
            dadosVisiveis: ['vida_intima.atividade_sexual']
        },
        usuario: {
            id: 7,
            papel: 'principal'
        }
    }

    const res = criarRespostaMock()
    const consoleErrorOriginal = console.error

    console.error = () => {}

    try {
        await controller.criarCategoria(
            req,
            res,
            erro => tratarErros(erro, req, res, () => {})
        )
    } finally {
        console.error = consoleErrorOriginal
    }

    const respostaSerializada = JSON.stringify(res.body)

    assert.equal(respostaSerializada.includes('Categoria extremamente privada'), false)
    assert.equal(respostaSerializada.includes('vida_intima.atividade_sexual'), false)
})