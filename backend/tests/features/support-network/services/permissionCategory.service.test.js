//Testa a criação segura de categorias e o isolamento dos dados por titular.
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarPermissionCategoryService } from '../../../../src/features/support-network/services/permissionCategory.service.js'

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
function criarPrismaMock({erroAoCriar, erroAoListar, categoriasAoListar = []} = {}) {
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
                },

                async findMany(operacao) {
                    chamadas.push(operacao)

                    if (erroAoListar) {
                        throw erroAoListar
                    }

                    return categoriasAoListar
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

test('lista somente categorias da titular e conta vínculos ativos', async () => {
    const categoriasAoListar = [
        {
            id: 30,
            nome: 'saúde',
            conjuntoDadosVisiveis: ['saude.consultas'],
            criadoEm,
            atualizadoEm,
            _count: {
                vinculos: 2
            }
        },
        {
            id: 20,
            nome: 'Família 10',
            conjuntoDadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
            criadoEm,
            atualizadoEm,
            _count: {
                vinculos: 1
            }
        },
        {
            id: 10,
            nome: 'Família 2',
            conjuntoDadosVisiveis: ['geral.fase_atual'],
            criadoEm,
            atualizadoEm,
            _count: {
                vinculos: 0
            }
        }
    ]
    const {prisma, chamadas} = criarPrismaMock({categoriasAoListar})
    const service = criarPermissionCategoryService({prisma})

    const categorias = await service.listarCategorias({
        titularId: 7,
        papel: 'principal'
    })

    assert.deepEqual(chamadas, [
        {
            where: {
                titularId: 7
            },
            select: {
                id: true,
                nome: true,
                conjuntoDadosVisiveis: true,
                criadoEm: true,
                atualizadoEm: true,
                _count: {
                    select: {
                        vinculos: {
                            where: {
                                status: 'ativo'
                            }
                        }
                    }
                }
            },
            orderBy: [
                {
                    nomeNormalizado: 'asc'
                },
                {
                    id: 'asc'
                }
            ]
        }
    ])

    assert.deepEqual(categorias, [
        {
            id: 10,
            nome: 'Família 2',
            dadosVisiveis: ['geral.fase_atual'],
            quantidadeContatos: 0,
            criadoEm,
            atualizadoEm
        },
        {
            id: 20,
            nome: 'Família 10',
            dadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
            quantidadeContatos: 1,
            criadoEm,
            atualizadoEm
        },
        {
            id: 30,
            nome: 'saúde',
            dadosVisiveis: ['saude.consultas'],
            quantidadeContatos: 2,
            criadoEm,
            atualizadoEm
        }
    ])
})

test('devolve lista vazia quando a titular ainda não possui categorias', async () => {
    const {prisma} = criarPrismaMock()
    const service = criarPermissionCategoryService({prisma})

    const categorias = await service.listarCategorias({
        titularId: 7,
        papel: 'principal_e_contato_apoio'
    })

    assert.deepEqual(categorias, [])
})

test('impede contato de apoio de consultar categorias da titular', async () => {
    const {prisma, chamadas} = criarPrismaMock()
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.listarCategorias({
            titularId: 7,
            papel: 'contato_apoio'
        }),
        erro => {
            assert.equal(erro.status, 403)
            assert.equal(erro.codigo, 'ACAO_NAO_PERMITIDA')
            assert.equal(erro.message, 'Somente a titular pode visualizar categorias de permissão.')

            return true
        }
    )

    assert.equal(chamadas.length, 0)
})

test('não consulta categorias quando a sessão é inválida', async () => {
    const {prisma, chamadas} = criarPrismaMock()
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.listarCategorias({
            titularId: 0,
            papel: 'principal'
        }),
        erro => {
            assert.equal(erro.status, 401)
            assert.equal(erro.codigo, 'SESSAO_INVALIDA')

            return true
        }
    )

    assert.equal(chamadas.length, 0)
})

test('preserva falha desconhecida ao listar categorias', async () => {
    const erroBanco = new Error('Banco indisponível')
    const {prisma} = criarPrismaMock({erroAoListar: erroBanco})
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.listarCategorias({
            titularId: 7,
            papel: 'principal'
        }),
        erro => erro === erroBanco
    )
})
