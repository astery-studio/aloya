import test from 'node:test';
import assert from 'node:assert/strict';

import { criarPermissionCategoryDeletionService } from '../../../../src/features/support-network/services/permissionCategoryDeletion.service.js';

const VERSAO = new Date('2026-10-26T12:00:00.000Z');

function criarCategoria(sobrescritas = {}) {
    return {
        id: 12,
        nome: 'Família',
        atualizadoEm: VERSAO,
        conjuntoDadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
        vinculos: [],
        ...sobrescritas
    };
}

function criarPrisma({ categoriaImpacto = criarCategoria(), categoriaExclusao = criarCategoria() } = {}) {
    const chamadas = [];
    const transacao = {
        categoriaPermissao: {
            async findFirst(argumentos) {
                chamadas.push(['categoria.findFirst.transacao', argumentos]);
                return categoriaExclusao;
            },
            async deleteMany(argumentos) {
                chamadas.push(['categoria.deleteMany', argumentos]);
                return { count: 1 };
            }
        },
        vinculoRedeApoio: {
            async updateMany(argumentos) {
                chamadas.push(['vinculo.updateMany', argumentos]);
                const ids = argumentos.where?.id?.in;
                return { count: Array.isArray(ids) ? ids.length : 0 };
            }
        }
    };
    const prisma = {
        categoriaPermissao: {
            async findFirst(argumentos) {
                chamadas.push(['categoria.findFirst', argumentos]);
                return categoriaImpacto;
            }
        },
        async $transaction(operacao) {
            chamadas.push(['transaction']);
            return operacao(transacao);
        }
    };

    return { prisma, transacao, chamadas };
}

function criarPedido(sobrescritas = {}) {
    return {
        titularId: 1,
        papel: 'principal',
        categoriaId: 12,
        atualizadoEm: VERSAO,
        decisoes: [],
        ...sobrescritas
    };
}

test('consulta somente contatos ativos da categoria pertencente à titular', async () => {
    const categoriaImpacto = criarCategoria({
        vinculos: [
            {
                id: 20,
                emailConvidado: 'ana@example.com',
                contato: { nome: 'Ana Martins' }
            },
            {
                id: 21,
                emailConvidado: 'carlos@example.com',
                contato: null
            }
        ]
    });
    const { prisma, chamadas } = criarPrisma({ categoriaImpacto });
    const service = criarPermissionCategoryDeletionService({ prisma });

    const impacto = await service.consultarImpacto(criarPedido());

    assert.deepEqual(impacto, {
        categoria: {
            id: 12,
            nome: 'Família',
            atualizadoEm: VERSAO
        },
        quantidadeContatos: 2,
        contatos: [
            { vinculoId: 20, nome: 'Ana Martins' },
            { vinculoId: 21, nome: 'carlos@example.com' }
        ]
    });
    assert.deepEqual(chamadas[0][1].where, {
        id: 12,
        titularId: 1
    });
    assert.deepEqual(chamadas[0][1].select.vinculos.where, {
        status: 'ativo'
    });
});

test('não revela categoria inexistente ou pertencente a outra titular', async () => {
    const { prisma } = criarPrisma({ categoriaImpacto: null });
    const service = criarPermissionCategoryDeletionService({ prisma });

    await assert.rejects(() => service.consultarImpacto(criarPedido()), {
        status: 404,
        codigo: 'CATEGORIA_NAO_ENCONTRADA',
        message: 'Categoria de permissão não encontrada.'
    });
});

test('impede contato de apoio de consultar ou excluir categoria', async () => {
    const { prisma, chamadas } = criarPrisma();
    const service = criarPermissionCategoryDeletionService({ prisma });
    const pedido = criarPedido({ papel: 'contato_apoio' });

    await assert.rejects(() => service.consultarImpacto(pedido), {
        status: 403,
        codigo: 'ACAO_NAO_PERMITIDA'
    });
    await assert.rejects(() => service.excluirCategoria(pedido), {
        status: 403,
        codigo: 'ACAO_NAO_PERMITIDA'
    });
    assert.deepEqual(chamadas, []);
});

test('exclui diretamente uma categoria sem contatos ativos', async () => {
    const { prisma, chamadas } = criarPrisma();
    const service = criarPermissionCategoryDeletionService({ prisma });

    const resultado = await service.excluirCategoria(criarPedido());

    assert.deepEqual(resultado, {
        categoriaId: 12,
        quantidadeAcessosRemovidos: 0,
        quantidadeAcessosMantidos: 0
    });
    assert.equal(chamadas.filter(([nome]) => nome === 'categoria.deleteMany').length, 1);
    assert.deepEqual(
        chamadas.find(([nome]) => nome === 'categoria.deleteMany')[1].where,
        {
            id: 12,
            titularId: 1,
            atualizadoEm: VERSAO
        }
    );
});

test('impede exclusão enquanto algum contato ativo estiver sem decisão', async () => {
    const categoriaExclusao = criarCategoria({
        vinculos: [{ id: 20 }, { id: 21 }]
    });
    const { prisma, chamadas } = criarPrisma({ categoriaExclusao });
    const service = criarPermissionCategoryDeletionService({ prisma });

    await assert.rejects(
        () =>
            service.excluirCategoria(
                criarPedido({
                    decisoes: [{ vinculoId: 20, acao: 'remover_acesso' }]
                })
            ),
        {
            status: 409,
            codigo: 'IMPACTO_EXCLUSAO_ALTERADO',
            quantidadeContatos: 2
        }
    );
    assert.equal(chamadas.some(([nome]) => nome === 'categoria.deleteMany'), false);
});

export { criarCategoria, criarPedido, criarPrisma };
