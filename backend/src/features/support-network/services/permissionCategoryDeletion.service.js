import { ACOES_EXCLUSAO_CATEGORIA } from '../validators/permissionCategoryDeletion.validator.js';

const PAPEIS_TITULAR = Object.freeze(['principal', 'principal_e_contato_apoio']);

function criarErro(mensagem, status, codigo) {
    const erro = new Error(mensagem);

    erro.status = status;
    erro.codigo = codigo;

    return erro;
}

function validarTitular(titularId, papel) {
    if (!Number.isSafeInteger(titularId) || titularId <= 0) {
        throw criarErro('Sua sessão é inválida.', 401, 'SESSAO_INVALIDA');
    }

    if (!PAPEIS_TITULAR.includes(papel)) {
        throw criarErro(
            'Somente a titular pode excluir categorias de permissão.',
            403,
            'ACAO_NAO_PERMITIDA'
        );
    }
}

function validarCategoriaId(categoriaId) {
    if (!Number.isSafeInteger(categoriaId) || categoriaId <= 0) {
        throw criarErro('Identificador de categoria inválido.', 400, 'ID_CATEGORIA_INVALIDO');
    }
}

function validarPedidoExclusao(atualizadoEm, decisoes) {
    if (!(atualizadoEm instanceof Date) || Number.isNaN(atualizadoEm.getTime())) {
        throw criarErro('A versão da categoria é inválida.', 422, 'VERSAO_CATEGORIA_INVALIDA');
    }

    if (!Array.isArray(decisoes)) {
        throw criarErro(
            'Informe uma decisão para cada contato vinculado à categoria.',
            422,
            'DECISOES_CONTATOS_OBRIGATORIAS'
        );
    }

    const ids = new Set();

    for (const decisao of decisoes) {
        if (
            decisao === null ||
            typeof decisao !== 'object' ||
            !Number.isSafeInteger(decisao.vinculoId) ||
            decisao.vinculoId <= 0 ||
            !Object.values(ACOES_EXCLUSAO_CATEGORIA).includes(decisao.acao) ||
            ids.has(decisao.vinculoId)
        ) {
            throw criarErro('A decisão informada é inválida.', 422, 'DECISAO_CONTATO_INVALIDA');
        }

        ids.add(decisao.vinculoId);
    }
}

function criarSelecaoCategoriaImpacto() {
    return {
        id: true,
        nome: true,
        atualizadoEm: true,
        vinculos: {
            where: {
                status: 'ativo'
            },
            orderBy: {
                id: 'asc'
            },
            select: {
                id: true,
                emailConvidado: true,
                contato: {
                    select: {
                        nome: true
                    }
                }
            }
        }
    };
}

function formatarImpacto(categoria) {
    const contatos = categoria.vinculos.map((vinculo) => ({
        vinculoId: vinculo.id,
        nome: vinculo.contato?.nome ?? vinculo.emailConvidado
    }));

    return {
        categoria: {
            id: categoria.id,
            nome: categoria.nome,
            atualizadoEm: categoria.atualizadoEm
        },
        quantidadeContatos: contatos.length,
        contatos
    };
}

function validarConjuntoDecisoes(vinculosAtivos, decisoes) {
    const idsAtivos = vinculosAtivos.map((vinculo) => vinculo.id).sort((a, b) => a - b);
    const idsDecididos = decisoes.map((decisao) => decisao.vinculoId).sort((a, b) => a - b);

    if (
        idsAtivos.length !== idsDecididos.length ||
        idsAtivos.some((id, indice) => id !== idsDecididos[indice])
    ) {
        const erro = criarErro(
            'Os contatos vinculados à categoria foram alterados. Revise as escolhas e tente novamente.',
            409,
            'IMPACTO_EXCLUSAO_ALTERADO'
        );

        erro.quantidadeContatos = idsAtivos.length;
        throw erro;
    }
}

function criarPermissionCategoryDeletionService({ prisma }) {
    async function consultarImpacto({ titularId, papel, categoriaId } = {}) {
        validarTitular(titularId, papel);
        validarCategoriaId(categoriaId);

        const categoria = await prisma.categoriaPermissao.findFirst({
            where: {
                id: categoriaId,
                titularId
            },
            select: criarSelecaoCategoriaImpacto()
        });

        if (!categoria) {
            throw criarErro(
                'Categoria de permissão não encontrada.',
                404,
                'CATEGORIA_NAO_ENCONTRADA'
            );
        }

        return formatarImpacto(categoria);
    }

    async function excluirCategoria({
        titularId,
        papel,
        categoriaId,
        atualizadoEm,
        decisoes
    } = {}) {
        validarTitular(titularId, papel);
        validarCategoriaId(categoriaId);
        validarPedidoExclusao(atualizadoEm, decisoes);

        try {
            return await prisma.$transaction(async (transacao) => {
                const categoria = await transacao.categoriaPermissao.findFirst({
                    where: {
                        id: categoriaId,
                        titularId
                    },
                    select: {
                        id: true,
                        atualizadoEm: true,
                        conjuntoDadosVisiveis: true,
                        vinculos: {
                            where: {
                                status: 'ativo'
                            },
                            select: {
                                id: true
                            }
                        }
                    }
                });

                if (!categoria) {
                    throw criarErro(
                        'Categoria de permissão não encontrada.',
                        404,
                        'CATEGORIA_NAO_ENCONTRADA'
                    );
                }

                if (categoria.atualizadoEm.getTime() !== atualizadoEm.getTime()) {
                    throw criarErro(
                        'A categoria foi alterada em outra operação. Atualize os dados e tente novamente.',
                        409,
                        'CONFLITO_EXCLUSAO_CATEGORIA'
                    );
                }

                validarConjuntoDecisoes(categoria.vinculos, decisoes);

                const idsRemover = decisoes
                    .filter((decisao) => decisao.acao === ACOES_EXCLUSAO_CATEGORIA.removerAcesso)
                    .map((decisao) => decisao.vinculoId);
                const idsManter = decisoes
                    .filter(
                        (decisao) =>
                            decisao.acao === ACOES_EXCLUSAO_CATEGORIA.manterAcessoIndividual
                    )
                    .map((decisao) => decisao.vinculoId);
                const dataResposta = new Date();

                if (idsRemover.length > 0) {
                    const removidos = await transacao.vinculoRedeApoio.updateMany({
                        where: {
                            id: { in: idsRemover },
                            titularId,
                            categoriaId,
                            status: 'ativo'
                        },
                        data: {
                            categoriaId: null,
                            permissoesIndividuais: [],
                            status: 'revogado',
                            tokenConviteHash: null,
                            dataResposta
                        }
                    });

                    if (removidos.count !== idsRemover.length) {
                        throw criarErro(
                            'Os contatos vinculados à categoria foram alterados. Revise as escolhas e tente novamente.',
                            409,
                            'IMPACTO_EXCLUSAO_ALTERADO'
                        );
                    }
                }

                if (idsManter.length > 0) {
                    const mantidos = await transacao.vinculoRedeApoio.updateMany({
                        where: {
                            id: { in: idsManter },
                            titularId,
                            categoriaId,
                            status: 'ativo'
                        },
                        data: {
                            categoriaId: null,
                            permissoesIndividuais: categoria.conjuntoDadosVisiveis
                        }
                    });

                    if (mantidos.count !== idsManter.length) {
                        throw criarErro(
                            'Os contatos vinculados à categoria foram alterados. Revise as escolhas e tente novamente.',
                            409,
                            'IMPACTO_EXCLUSAO_ALTERADO'
                        );
                    }
                }

                await transacao.vinculoRedeApoio.updateMany({
                    where: {
                        titularId,
                        categoriaId,
                        NOT: {
                            status: 'ativo'
                        }
                    },
                    data: {
                        categoriaId: null,
                        permissoesIndividuais: [],
                        status: 'revogado',
                        tokenConviteHash: null,
                        dataResposta
                    }
                });

                const exclusao = await transacao.categoriaPermissao.deleteMany({
                    where: {
                        id: categoriaId,
                        titularId,
                        atualizadoEm
                    }
                });

                if (exclusao.count !== 1) {
                    throw criarErro(
                        'A categoria foi alterada em outra operação. Atualize os dados e tente novamente.',
                        409,
                        'CONFLITO_EXCLUSAO_CATEGORIA'
                    );
                }

                return {
                    categoriaId,
                    quantidadeAcessosRemovidos: idsRemover.length,
                    quantidadeAcessosMantidos: idsManter.length
                };
            });
        } catch (erro) {
            if (erro.code === 'P2003') {
                throw criarErro(
                    'Os contatos vinculados à categoria foram alterados. Revise as escolhas e tente novamente.',
                    409,
                    'IMPACTO_EXCLUSAO_ALTERADO'
                );
            }

            throw erro;
        }
    }

    return {
        consultarImpacto,
        excluirCategoria
    };
}

export { criarPermissionCategoryDeletionService };
