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

function criarPrisma({
    categoriaImpacto = criarCategoria(),
    categoriaExclusao = criarCategoria(),
    quantidadeCategoriasExcluidas = 1,
    quantidadeVinculosAtualizados,
    erroTransacao
} = {}) {
    const chamadas = [];
    const transacao = {
        categoriaPermissao: {
            async findFirst(argumentos) {
                chamadas.push(['categoria.findFirst.transacao', argumentos]);
                return categoriaExclusao;
            },
            async deleteMany(argumentos) {
                chamadas.push(['categoria.deleteMany', argumentos]);
                return { count: quantidadeCategoriasExcluidas };
            }
        },
        vinculoRedeApoio: {
            async updateMany(argumentos) {
                chamadas.push(['vinculo.updateMany', argumentos]);
                const ids = argumentos.where?.id?.in;
                const quantidadePadrao = Array.isArray(ids) ? ids.length : 0;
                return {
                    count:
                        quantidadeVinculosAtualizados === undefined
                            ? quantidadePadrao
                            : quantidadeVinculosAtualizados
                };
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

            if (erroTransacao) {
                throw erroTransacao;
            }

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

test('rejeita decisão referente a vínculo que não pertence mais à categoria', async () => {
    const categoriaExclusao = criarCategoria({ vinculos: [{ id: 20 }] });
    const { prisma } = criarPrisma({ categoriaExclusao });
    const service = criarPermissionCategoryDeletionService({ prisma });

    await assert.rejects(
        () =>
            service.excluirCategoria(
                criarPedido({
                    decisoes: [
                        { vinculoId: 20, acao: 'remover_acesso' },
                        { vinculoId: 999, acao: 'remover_acesso' }
                    ]
                })
            ),
        {
            status: 409,
            codigo: 'IMPACTO_EXCLUSAO_ALTERADO'
        }
    );
});

test('revoga imediatamente o acesso escolhido para remoção', async () => {
    const categoriaExclusao = criarCategoria({ vinculos: [{ id: 20 }] });
    const { prisma, chamadas } = criarPrisma({ categoriaExclusao });
    const service = criarPermissionCategoryDeletionService({ prisma });

    const resultado = await service.excluirCategoria(
        criarPedido({
            decisoes: [{ vinculoId: 20, acao: 'remover_acesso' }]
        })
    );

    const atualizacao = chamadas.find(
        ([nome, argumentos]) => nome === 'vinculo.updateMany' && argumentos.where?.id
    )[1];

    assert.deepEqual(atualizacao.where, {
        id: { in: [20] },
        titularId: 1,
        categoriaId: 12,
        status: 'ativo'
    });
    assert.equal(atualizacao.data.categoriaId, null);
    assert.deepEqual(atualizacao.data.permissoesIndividuais, []);
    assert.equal(atualizacao.data.status, 'revogado');
    assert.equal(atualizacao.data.tokenConviteHash, null);
    assert.equal(atualizacao.data.dataResposta instanceof Date, true);
    assert.equal(resultado.quantidadeAcessosRemovidos, 1);
});

test('converte em individual preservando as permissões da categoria', async () => {
    const categoriaExclusao = criarCategoria({ vinculos: [{ id: 21 }] });
    const { prisma, chamadas } = criarPrisma({ categoriaExclusao });
    const service = criarPermissionCategoryDeletionService({ prisma });

    const resultado = await service.excluirCategoria(
        criarPedido({
            decisoes: [{ vinculoId: 21, acao: 'manter_acesso_individual' }]
        })
    );

    const atualizacao = chamadas.find(
        ([nome, argumentos]) => nome === 'vinculo.updateMany' && argumentos.where?.id
    )[1];

    assert.deepEqual(atualizacao.where.id, { in: [21] });
    assert.equal(atualizacao.data.categoriaId, null);
    assert.deepEqual(atualizacao.data.permissoesIndividuais, [
        'geral.fase_atual',
        'emocional.sintomas_emocionais'
    ]);
    assert.equal('status' in atualizacao.data, false);
    assert.equal(resultado.quantidadeAcessosMantidos, 1);
});

test('aplica decisões mistas em lote antes de apagar a categoria', async () => {
    const categoriaExclusao = criarCategoria({
        vinculos: [{ id: 20 }, { id: 21 }, { id: 22 }]
    });
    const { prisma, chamadas } = criarPrisma({ categoriaExclusao });
    const service = criarPermissionCategoryDeletionService({ prisma });

    const resultado = await service.excluirCategoria(
        criarPedido({
            decisoes: [
                { vinculoId: 20, acao: 'remover_acesso' },
                { vinculoId: 21, acao: 'manter_acesso_individual' },
                { vinculoId: 22, acao: 'remover_acesso' }
            ]
        })
    );

    const atualizacoesAtivas = chamadas.filter(
        ([nome, argumentos]) => nome === 'vinculo.updateMany' && argumentos.where?.id
    );

    assert.deepEqual(atualizacoesAtivas[0][1].where.id.in, [20, 22]);
    assert.deepEqual(atualizacoesAtivas[1][1].where.id.in, [21]);
    assert.deepEqual(resultado, {
        categoriaId: 12,
        quantidadeAcessosRemovidos: 2,
        quantidadeAcessosMantidos: 1
    });
    assert.equal(chamadas.at(-1)[0], 'categoria.deleteMany');
});

test('revoga convites e vínculos inativos restantes antes da exclusão', async () => {
    const { prisma, chamadas } = criarPrisma();
    const service = criarPermissionCategoryDeletionService({ prisma });

    await service.excluirCategoria(criarPedido());

    const atualizacao = chamadas.find(
        ([nome, argumentos]) => nome === 'vinculo.updateMany' && argumentos.where?.NOT
    )[1];

    assert.deepEqual(atualizacao.where, {
        titularId: 1,
        categoriaId: 12,
        NOT: { status: 'ativo' }
    });
    assert.equal(atualizacao.data.categoriaId, null);
    assert.equal(atualizacao.data.status, 'revogado');
    assert.equal(atualizacao.data.tokenConviteHash, null);
    assert.deepEqual(atualizacao.data.permissoesIndividuais, []);
});

test('rejeita formulário carregado de uma versão antiga da categoria', async () => {
    const categoriaExclusao = criarCategoria({
        atualizadoEm: new Date('2026-10-26T12:30:00.000Z')
    });
    const { prisma, chamadas } = criarPrisma({ categoriaExclusao });
    const service = criarPermissionCategoryDeletionService({ prisma });

    await assert.rejects(() => service.excluirCategoria(criarPedido()), {
        status: 409,
        codigo: 'CONFLITO_EXCLUSAO_CATEGORIA'
    });
    assert.equal(chamadas.some(([nome]) => nome === 'vinculo.updateMany'), false);
    assert.equal(chamadas.some(([nome]) => nome === 'categoria.deleteMany'), false);
});

test('detecta concorrência ocorrida no instante de apagar a categoria', async () => {
    const { prisma } = criarPrisma({ quantidadeCategoriasExcluidas: 0 });
    const service = criarPermissionCategoryDeletionService({ prisma });

    await assert.rejects(() => service.excluirCategoria(criarPedido()), {
        status: 409,
        codigo: 'CONFLITO_EXCLUSAO_CATEGORIA'
    });
});

test('interrompe a transação quando um vínculo ativo muda durante a exclusão', async () => {
    const categoriaExclusao = criarCategoria({ vinculos: [{ id: 20 }] });
    const { prisma, chamadas } = criarPrisma({
        categoriaExclusao,
        quantidadeVinculosAtualizados: 0
    });
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
            codigo: 'IMPACTO_EXCLUSAO_ALTERADO'
        }
    );
    assert.equal(chamadas.some(([nome]) => nome === 'categoria.deleteMany'), false);
});

test('converte conflito de chave estrangeira em impacto desatualizado', async () => {
    const erroTransacao = Object.assign(new Error('foreign key constraint'), {
        code: 'P2003'
    });
    const { prisma } = criarPrisma({ erroTransacao });
    const service = criarPermissionCategoryDeletionService({ prisma });

    await assert.rejects(() => service.excluirCategoria(criarPedido()), {
        status: 409,
        codigo: 'IMPACTO_EXCLUSAO_ALTERADO',
        message:
            'Os contatos vinculados à categoria foram alterados. Revise as escolhas e tente novamente.'
    });
});

export { criarCategoria, criarPedido, criarPrisma };
