//Testa as respostas HTTP e o uso seguro da identidade da sessão.
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarPermissionCategoryController } from '../src/controllers/permissionCategory.controller.js'

//Cria uma resposta Express controlada para os testes.
function criarRespostaMock() {
    return {
        statusRecebido: null,
        corpoRecebido: null,
        cabecalhos: {},

        set(nome, valor) {
            this.cabecalhos[nome] = valor

            return this
        },

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

//Cria os dados seguros devolvidos pelo validator.
function criarValidacaoValida() {
    return {
        valido: true,
        erros: [],
        dados: {
            nome: 'Família',
            nomeNormalizado: 'família',
            dadosVisiveis: ['geral.fase_atual']
        }
    }
}

//Cria o resultado devolvido pelo service.
function criarCategoriaCriada() {
    return {
        id: 10,
        nome: 'Família',
        dadosVisiveis: ['geral.fase_atual'],
        quantidadeContatos: 0,
        criadoEm: new Date('2026-09-24T10:00:00.000Z'),
        atualizadoEm: new Date('2026-09-24T10:00:00.000Z')
    }
}

test('retorna 422 e não chama o service quando o nome está vazio', async () => {
    let serviceChamado = false

    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return {
                    valido: false,
                    erros: [
                        {
                            campo: 'nome',
                            mensagem: 'Dê um nome para a categoria.'
                        }
                    ],
                    dados: {}
                }
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                serviceChamado = true
            }
        }
    })

    const res = criarRespostaMock()

    await controller.criarCategoria(
        {
            body: {
                nome: '   ',
                dadosVisiveis: ['geral.fase_atual']
            },
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    )

    assert.equal(serviceChamado, false)
    assert.equal(res.statusRecebido, 422)

    assert.deepEqual(res.corpoRecebido, {
        erro: {
            codigo: 'ERRO_VALIDACAO',
            mensagem: 'Dê um nome para a categoria.',
            detalhes: [
                {
                    campo: 'nome',
                    mensagem: 'Dê um nome para a categoria.'
                }
            ]
        }
    })
})

test('retorna a mensagem exigida quando nenhuma permissão foi selecionada', async () => {
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return {
                    valido: false,
                    erros: [
                        {
                            campo: 'dadosVisiveis',
                            mensagem: 'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'
                        }
                    ],
                    dados: {}
                }
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                assert.fail('O service não deveria ser chamado.')
            }
        }
    })

    const res = criarRespostaMock()

    await controller.criarCategoria(
        {
            body: {
                nome: 'Família',
                dadosVisiveis: []
            },
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    )

    assert.equal(res.statusRecebido, 422)
    assert.equal(res.corpoRecebido.erro.mensagem, 'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.')
})

test('cria a categoria usando somente a identidade da sessão', async () => {
    let dadosRecebidos = null
    const categoria = criarCategoriaCriada()

    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida()
            }
        },
        permissionCategoryService: {
            async criarCategoria(dados) {
                dadosRecebidos = dados

                return categoria
            }
        }
    })

    const res = criarRespostaMock()

    await controller.criarCategoria(
        {
            body: {
                titularId: 999,
                papel: 'administrador',
                nome: 'Família',
                dadosVisiveis: ['geral.fase_atual']
            },
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    )

    assert.deepEqual(dadosRecebidos, {
        titularId: 7,
        papel: 'principal',
        nome: 'Família',
        dadosVisiveis: ['geral.fase_atual']
    })

    assert.equal(res.statusRecebido, 201)
    assert.equal(res.cabecalhos['Cache-Control'], 'no-store')

    assert.deepEqual(res.corpoRecebido, {
        mensagem: 'Categoria criada com sucesso.',
        categoria
    })
})

test('encaminha o conflito de nome sem substituir sua mensagem', async () => {
    const erroDuplicidade = new Error('Você já tem uma categoria com esse nome.')

    erroDuplicidade.status = 409
    erroDuplicidade.codigo = 'CATEGORIA_NOME_DUPLICADO'

    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida()
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                throw erroDuplicidade
            }
        }
    })

    let erroRecebido = null

    await controller.criarCategoria(
        {
            body: {},
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        criarRespostaMock(),
        erro => {
            erroRecebido = erro
        }
    )

    assert.equal(erroRecebido, erroDuplicidade)
    assert.equal(erroRecebido.mensagemUsuario, undefined)
})

test('define mensagem pública segura para erro interno inesperado', async () => {
    const erroInterno = new Error('Detalhes privados do banco')

    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida()
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                throw erroInterno
            }
        }
    })

    let erroRecebido = null

    await controller.criarCategoria(
        {
            body: {},
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        criarRespostaMock(),
        erro => {
            erroRecebido = erro
        }
    )

    assert.equal(erroRecebido, erroInterno)
    assert.equal(erroRecebido.mensagemUsuario, 'Ocorreu um erro ao criar sua categoria. Verifique sua conexão e tente novamente.')
    assert.equal(erroRecebido.status, undefined)
})

test('não devolve nome normalizado nem titularId na resposta', async () => {
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida()
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                return criarCategoriaCriada()
            }
        }
    })

    const res = criarRespostaMock()

    await controller.criarCategoria(
        {
            body: {},
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    )

    const respostaSerializada = JSON.stringify(res.corpoRecebido)

    assert.equal(respostaSerializada.includes('nomeNormalizado'), false)
    assert.equal(respostaSerializada.includes('titularId'), false)
})