//Testa a criação segura de categorias e o isolamento dos dados por titular.
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarPermissionCategoryService } from '../src/services/permissionCategory.service.js'

const criadoEm = new Date('2026-09-24T10:00:00.000Z')
const atualizadoEm = new Date('2026-09-24T10:00:00.000Z')

//Cria os dados válidos usados nos testes do service.
function criarPedidoValido() {
    return {
        titularId: 7,
        papel: 'principal',
        nome: 'Família',
        dadosVisiveis: [
            'ciclo.fluxo_menstrual',
            'geral.fase_atual'
        ]
    }
}

//Cria um Prisma controlado e registra todas as operações recebidas.
function criarPrismaMock({erroAoCriar} = {}) {
    const chamadas = []

    return {
        chamadas,
        prisma: {
            categoriaPermissao: {
                async create(operacao) {
                    chamadas.push(operacao)

                    if (erroAoCriar) {
                        throw erroAoCriar
                    }

                    return {
                        id: 12,
                        nome: operacao.data.nome,
                        conjuntoDadosVisiveis: operacao.data.conjuntoDadosVisiveis,
                        criadoEm,
                        atualizadoEm,
                        _count: {
                            vinculos: 0
                        }
                    }
                }
            }
        }
    }
}

test('cria a categoria para a titular autenticada e retorna zero contatos', async () => {
    const {prisma, chamadas} = criarPrismaMock()
    const service = criarPermissionCategoryService({prisma})
    const categoria = await service.criarCategoria(criarPedidoValido())

    assert.equal(chamadas.length, 1)

    assert.deepEqual(chamadas[0].data, {
        titularId: 7,
        nome: 'Família',
        nomeNormalizado: 'família',
        conjuntoDadosVisiveis: [
            'geral.fase_atual',
            'ciclo.fluxo_menstrual'
        ]
    })

    assert.deepEqual(categoria, {
        id: 12,
        nome: 'Família',
        dadosVisiveis: [
            'geral.fase_atual',
            'ciclo.fluxo_menstrual'
        ],
        quantidadeContatos: 0,
        criadoEm,
        atualizadoEm
    })
})

test('permite criar categorias para uma titular que também é contato de apoio', async () => {
    const {prisma, chamadas} = criarPrismaMock()
    const service = criarPermissionCategoryService({prisma})

    await service.criarCategoria({
        ...criarPedidoValido(),
        papel: 'principal_e_contato_apoio'
    })

    assert.equal(chamadas.length, 1)
})

test('impede contato de apoio de criar categoria', async () => {
    const {prisma, chamadas} = criarPrismaMock()
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.criarCategoria({
            ...criarPedidoValido(),
            papel: 'contato_apoio'
        }),
        erro => {
            assert.equal(erro.status, 403)
            assert.equal(erro.codigo, 'ACAO_NAO_PERMITIDA')
            assert.equal(erro.message, 'Somente a titular pode criar categorias de permissão.')

            return true
        }
    )

    assert.equal(chamadas.length, 0)
})

test('não consulta o banco quando o id da sessão é inválido', async () => {
    const {prisma, chamadas} = criarPrismaMock()
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.criarCategoria({
            ...criarPedidoValido(),
            titularId: 0
        }),
        erro => {
            assert.equal(erro.status, 401)
            assert.equal(erro.codigo, 'SESSAO_INVALIDA')

            return true
        }
    )

    assert.equal(chamadas.length, 0)
})

test('mantém validação defensiva mesmo quando o service é chamado diretamente', async () => {
    const {prisma, chamadas} = criarPrismaMock()
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.criarCategoria({
            ...criarPedidoValido(),
            dadosVisiveis: ['administrador.acesso_total']
        }),
        erro => {
            assert.equal(erro.status, 422)
            assert.equal(erro.codigo, 'PERMISSAO_CATEGORIA_INVALIDA')

            return true
        }
    )

    assert.equal(chamadas.length, 0)
})

test('converte conflito P2002 em mensagem de categoria existente', async () => {
    const erroPrisma = new Error('Unique constraint failed')

    erroPrisma.code = 'P2002'

    const {prisma} = criarPrismaMock({
        erroAoCriar: erroPrisma
    })

    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.criarCategoria(criarPedidoValido()),
        erro => {
            assert.equal(erro.status, 409)
            assert.equal(erro.codigo, 'CATEGORIA_NOME_DUPLICADO')
            assert.equal(erro.message, 'Você já tem uma categoria com esse nome.')

            return true
        }
    )
})

test('não transforma falha desconhecida do banco em erro de duplicidade', async () => {
    const erroBanco = new Error('Banco indisponível')
    const {prisma} = criarPrismaMock({erroAoCriar: erroBanco})
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.criarCategoria(criarPedidoValido()),
        erro => {
            assert.equal(erro, erroBanco)
            assert.equal(erro.status, undefined)
            assert.equal(erro.codigo, undefined)

            return true
        }
    )
})

test('não impõe limite total de categorias por titular', async () => {
    const {prisma, chamadas} = criarPrismaMock()
    const service = criarPermissionCategoryService({prisma})

    await service.criarCategoria(criarPedidoValido())

    await service.criarCategoria({
        ...criarPedidoValido(),
        nome: 'Equipe médica'
    })

    assert.equal(chamadas.length, 2)
})