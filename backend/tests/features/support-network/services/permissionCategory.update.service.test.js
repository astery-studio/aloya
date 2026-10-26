import test from 'node:test'
import assert from 'node:assert/strict'

import {criarPermissionCategoryService} from '../../../../src/features/support-network/services/permissionCategory.service.js'

const criadoEm = new Date('2026-10-01T10:00:00.000Z')
const atualizadoEm = new Date('2026-10-26T12:00:00.000Z')
const novoAtualizadoEm = new Date('2026-10-26T13:00:00.000Z')

function criarPedidoEdicao(alteracoes = {}) {
    return {
        titularId: 7,
        papel: 'principal',
        categoriaId: 12,
        nome: 'Namorado',
        dadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
        atualizadoEm,
        quantidadeContatosConfirmada: null,
        ...alteracoes
    }
}

function criarPrismaEdicaoMock({
    quantidadeContatos = 0,
    categoriaEncontrada = true,
    versaoAtual = atualizadoEm
} = {}) {
    const chamadas = []
    const categoriaAtual = {
        id: 12,
        nome: 'Parceiro(a)',
        nomeNormalizado: 'parceiro(a)',
        conjuntoDadosVisiveis: ['geral.fase_atual'],
        criadoEm,
        atualizadoEm: versaoAtual,
        _count: {
            vinculos: quantidadeContatos
        }
    }
    const categoriaAtualizada = {
        ...categoriaAtual,
        nome: 'Namorado',
        nomeNormalizado: 'namorado',
        conjuntoDadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
        atualizadoEm: novoAtualizadoEm
    }
    let consultas = 0

    const transacao = {
        categoriaPermissao: {
            async findFirst(argumentos) {
                chamadas.push({operacao: 'findFirst', argumentos})
                consultas += 1
                return consultas === 1
                    ? (categoriaEncontrada ? categoriaAtual : null)
                    : categoriaAtualizada
            },
            async updateMany(argumentos) {
                chamadas.push({operacao: 'updateMany', argumentos})
                return {count: 1}
            }
        }
    }

    return {
        chamadas,
        prisma: {
            async $transaction(operacao) {
                chamadas.push({operacao: 'transaction'})
                return operacao(transacao)
            }
        }
    }
}

test('atualiza diretamente uma categoria sem contatos vinculados', async () => {
    const {prisma, chamadas} = criarPrismaEdicaoMock()
    const service = criarPermissionCategoryService({prisma})

    const categoria = await service.editarCategoria(criarPedidoEdicao())

    const atualizacao = chamadas.find(chamada => chamada.operacao === 'updateMany')

    assert.deepEqual(atualizacao.argumentos.data, {
        nome: 'Namorado',
        nomeNormalizado: 'namorado',
        conjuntoDadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais']
    })
    assert.deepEqual(categoria, {
        id: 12,
        nome: 'Namorado',
        dadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
        quantidadeContatos: 0,
        criadoEm,
        atualizadoEm: novoAtualizadoEm
    })
})

test('não revela categoria inexistente ou pertencente a outra titular', async () => {
    const {prisma, chamadas} = criarPrismaEdicaoMock({categoriaEncontrada: false})
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.editarCategoria(criarPedidoEdicao()),
        erro => {
            assert.equal(erro.status, 404)
            assert.equal(erro.codigo, 'CATEGORIA_NAO_ENCONTRADA')
            return true
        }
    )

    const consulta = chamadas.find(chamada => chamada.operacao === 'findFirst')
    assert.deepEqual(consulta.argumentos.where, {id: 12, titularId: 7})
    assert.equal(chamadas.some(chamada => chamada.operacao === 'updateMany'), false)
})

test('impede contato de apoio de editar categoria da titular', async () => {
    const {prisma, chamadas} = criarPrismaEdicaoMock()
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.editarCategoria(criarPedidoEdicao({papel: 'contato_apoio'})),
        erro => {
            assert.equal(erro.status, 403)
            assert.equal(erro.codigo, 'ACAO_NAO_PERMITIDA')
            assert.equal(erro.message, 'Somente a titular pode editar categorias de permissão.')
            return true
        }
    )

    assert.deepEqual(chamadas, [])
})

test('não inicia transação com id ou versão inválidos', async () => {
    const {prisma, chamadas} = criarPrismaEdicaoMock()
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.editarCategoria(criarPedidoEdicao({categoriaId: 0})),
        erro => erro.codigo === 'ID_CATEGORIA_INVALIDO'
    )
    await assert.rejects(
        () => service.editarCategoria(criarPedidoEdicao({atualizadoEm: '2026-10-26'})),
        erro => erro.codigo === 'VERSAO_CATEGORIA_INVALIDA'
    )

    assert.deepEqual(chamadas, [])
})

test('rejeita salvamento sem alteração real', async () => {
    const {prisma, chamadas} = criarPrismaEdicaoMock()
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.editarCategoria(criarPedidoEdicao({
            nome: 'Parceiro(a)',
            dadosVisiveis: ['geral.fase_atual']
        })),
        erro => {
            assert.equal(erro.status, 422)
            assert.equal(erro.codigo, 'SEM_ALTERACOES')
            return true
        }
    )

    assert.equal(chamadas.some(chamada => chamada.operacao === 'updateMany'), false)
})

test('rejeita formulário carregado a partir de uma versão antiga', async () => {
    const {prisma, chamadas} = criarPrismaEdicaoMock({versaoAtual: novoAtualizadoEm})
    const service = criarPermissionCategoryService({prisma})

    await assert.rejects(
        () => service.editarCategoria(criarPedidoEdicao()),
        erro => {
            assert.equal(erro.status, 409)
            assert.equal(erro.codigo, 'CONFLITO_EDICAO_CATEGORIA')
            return true
        }
    )

    assert.equal(chamadas.some(chamada => chamada.operacao === 'updateMany'), false)
})
