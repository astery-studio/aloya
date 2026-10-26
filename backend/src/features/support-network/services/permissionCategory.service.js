//Gerencia categorias de permissão pertencentes exclusivamente à titular autenticada.
import {
    ordenarPermissoesCategoria,
    permissaoCategoriaEhValida
} from '../constants/permissionCategory.constants.js';

const PAPEIS_TITULAR = Object.freeze(['principal', 'principal_e_contato_apoio']);

const comparadorDeNomes = new Intl.Collator('pt-BR', {
    numeric: true,
    sensitivity: 'base'
});

//Cria um erro público controlado sem expor detalhes internos do banco.
function criarErro(mensagem, status, codigo) {
    const erro = new Error(mensagem);

    erro.status = status;
    erro.codigo = codigo;

    return erro;
}

//Confirma que a operação está sendo executada por uma titular válida.
function validarTitular(
    titularId,
    papel,
    mensagemAcao = 'Somente a titular pode criar categorias de permissão.'
) {
    if (!Number.isInteger(titularId) || titularId <= 0) {
        throw criarErro('Sua sessão é inválida.', 401, 'SESSAO_INVALIDA');
    }

    if (!PAPEIS_TITULAR.includes(papel)) {
        throw criarErro(mensagemAcao, 403, 'ACAO_NAO_PERMITIDA');
    }
}

//Confirma novamente os dados essenciais antes de qualquer acesso ao banco.
function validarDadosDaCategoria(nome, dadosVisiveis) {
    if (typeof nome !== 'string' || nome.trim().length === 0) {
        throw criarErro('Dê um nome para a categoria.', 422, 'NOME_CATEGORIA_OBRIGATORIO');
    }

    if (!Array.isArray(dadosVisiveis) || dadosVisiveis.length === 0) {
        throw criarErro(
            'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.',
            422,
            'PERMISSAO_CATEGORIA_OBRIGATORIA'
        );
    }

    if (dadosVisiveis.some((permissao) => !permissaoCategoriaEhValida(permissao))) {
        throw criarErro(
            'A seleção contém permissões inválidas.',
            422,
            'PERMISSAO_CATEGORIA_INVALIDA'
        );
    }
}

//Cria a versão usada pela restrição única do banco.
function normalizarNomeParaComparacao(nome) {
    return nome.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('pt-BR');
}

//Converte o formato interno do Prisma no contrato seguro devolvido pela API.
function formatarCategoria(categoria) {
    return {
        id: categoria.id,
        nome: categoria.nome,
        dadosVisiveis: categoria.conjuntoDadosVisiveis,
        quantidadeContatos: categoria._count.vinculos,
        criadoEm: categoria.criadoEm,
        atualizadoEm: categoria.atualizadoEm
    };
}

//Garante ordem alfabética adequada ao português e resultado estável em nomes equivalentes.
function compararCategorias(primeira, segunda) {
    const resultado = comparadorDeNomes.compare(primeira.nome, segunda.nome);

    return resultado !== 0 ? resultado : primeira.id - segunda.id;
}

//Compara listas já normalizadas sem depender da identidade dos arrays.
function permissoesSaoIguais(permissoesAtuais, permissoesNovas) {
    return JSON.stringify(permissoesAtuais) === JSON.stringify(permissoesNovas);
}

function criarPermissionCategoryService({ prisma }) {
    //Cria uma categoria sem aceitar titularId ou quantidade de contatos vindos do cliente.
    async function criarCategoria({ titularId, papel, nome, dadosVisiveis }) {
        validarTitular(titularId, papel);
        validarDadosDaCategoria(nome, dadosVisiveis);

        const nomeNormalizado = normalizarNomeParaComparacao(nome);
        const permissoesOrdenadas = ordenarPermissoesCategoria(dadosVisiveis);

        try {
            const categoria = await prisma.categoriaPermissao.create({
                data: {
                    titularId,
                    nome,
                    nomeNormalizado,
                    conjuntoDadosVisiveis: permissoesOrdenadas
                },
                select: {
                    id: true,
                    nome: true,
                    conjuntoDadosVisiveis: true,
                    criadoEm: true,
                    atualizadoEm: true,
                    _count: {
                        select: {
                            vinculos: true
                        }
                    }
                }
            });

            return formatarCategoria(categoria);
        } catch (erro) {
            if (erro.code === 'P2002') {
                throw criarErro(
                    'Você já tem uma categoria com esse nome.',
                    409,
                    'CATEGORIA_NOME_DUPLICADO'
                );
            }

            throw erro;
        }
    }

    //Lista somente categorias da titular e conta apenas contatos com vínculo ativo.
    async function listarCategorias({ titularId, papel } = {}) {
        validarTitular(
            titularId,
            papel,
            'Somente a titular pode visualizar categorias de permissão.'
        );

        if (typeof prisma?.categoriaPermissao?.findMany !== 'function') {
            throw new TypeError('Não foi possível consultar as categorias de permissão.');
        }

        const categorias = await prisma.categoriaPermissao.findMany({
            where: {
                titularId
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
        });

        if (!Array.isArray(categorias)) {
            throw new TypeError('A listagem de categorias de permissão é inválida.');
        }

        return categorias.map(formatarCategoria).sort(compararCategorias);
    }

    //Substitui os campos editáveis da categoria compartilhada em uma única transação.
    async function editarCategoria({
        titularId,
        papel,
        categoriaId,
        nome,
        dadosVisiveis,
        atualizadoEm,
        quantidadeContatosConfirmada = null
    } = {}) {
        validarTitular(titularId, papel, 'Somente a titular pode editar categorias de permissão.');
        validarDadosDaCategoria(nome, dadosVisiveis);

        if (!Number.isSafeInteger(categoriaId) || categoriaId <= 0) {
            throw criarErro('Identificador de categoria inválido.', 400, 'ID_CATEGORIA_INVALIDO');
        }

        if (!(atualizadoEm instanceof Date) || Number.isNaN(atualizadoEm.getTime())) {
            throw criarErro('A versão da categoria é inválida.', 422, 'VERSAO_CATEGORIA_INVALIDA');
        }

        const nomeNormalizado = normalizarNomeParaComparacao(nome);
        const permissoesOrdenadas = ordenarPermissoesCategoria(dadosVisiveis);

        try {
            return await prisma.$transaction(async (transacao) => {
                const categoriaAtual = await transacao.categoriaPermissao.findFirst({
                    where: {
                        id: categoriaId,
                        titularId
                    },
                    select: {
                        id: true,
                        nome: true,
                        nomeNormalizado: true,
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
                    }
                });

                if (!categoriaAtual) {
                    throw criarErro(
                        'Categoria de permissão não encontrada.',
                        404,
                        'CATEGORIA_NAO_ENCONTRADA'
                    );
                }

                if (categoriaAtual.atualizadoEm.getTime() !== atualizadoEm.getTime()) {
                    throw criarErro(
                        'A categoria foi alterada em outra operação. Atualize os dados e tente novamente.',
                        409,
                        'CONFLITO_EDICAO_CATEGORIA'
                    );
                }

                const possuiAlteracao =
                    categoriaAtual.nome !== nome ||
                    categoriaAtual.nomeNormalizado !== nomeNormalizado ||
                    !permissoesSaoIguais(categoriaAtual.conjuntoDadosVisiveis, permissoesOrdenadas);

                if (!possuiAlteracao) {
                    throw criarErro(
                        'Faça ao menos uma alteração antes de salvar.',
                        422,
                        'SEM_ALTERACOES'
                    );
                }

                const quantidadeContatos = categoriaAtual._count.vinculos;

                if (quantidadeContatos > 0 && quantidadeContatosConfirmada !== quantidadeContatos) {
                    const erro = criarErro(
                        `Esta alteração afetará imediatamente ${quantidadeContatos} contato(s) vinculado(s) a esta categoria. Deseja continuar?`,
                        409,
                        'CONFIRMACAO_IMPACTO_NECESSARIA'
                    );

                    erro.quantidadeContatos = quantidadeContatos;
                    throw erro;
                }

                const resultado = await transacao.categoriaPermissao.updateMany({
                    where: {
                        id: categoriaId,
                        titularId,
                        atualizadoEm
                    },
                    data: {
                        nome,
                        nomeNormalizado,
                        conjuntoDadosVisiveis: permissoesOrdenadas
                    }
                });

                if (resultado.count !== 1) {
                    throw criarErro(
                        'A categoria foi alterada em outra operação. Atualize os dados e tente novamente.',
                        409,
                        'CONFLITO_EDICAO_CATEGORIA'
                    );
                }

                const categoriaAtualizada = await transacao.categoriaPermissao.findFirst({
                    where: {
                        id: categoriaId,
                        titularId
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
                    }
                });

                if (!categoriaAtualizada) {
                    throw criarErro(
                        'A categoria foi alterada em outra operação. Atualize os dados e tente novamente.',
                        409,
                        'CONFLITO_EDICAO_CATEGORIA'
                    );
                }

                return formatarCategoria(categoriaAtualizada);
            });
        } catch (erro) {
            if (erro.code === 'P2002') {
                throw criarErro(
                    'Você já tem uma categoria com esse nome.',
                    409,
                    'CATEGORIA_NOME_DUPLICADO'
                );
            }

            throw erro;
        }
    }

    return {
        criarCategoria,
        listarCategorias,
        editarCategoria
    };
}

export { criarPermissionCategoryService };
