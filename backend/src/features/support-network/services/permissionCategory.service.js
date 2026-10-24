//Cria categorias de permissão pertencentes exclusivamente à titular autenticada.
import { ordenarPermissoesCategoria, permissaoCategoriaEhValida } from '../constants/permissionCategory.constants.js'

const PAPEIS_TITULAR = Object.freeze([
    'principal',
    'principal_e_contato_apoio'
])

//Cria um erro público controlado sem expor detalhes internos do banco.
function criarErro(mensagem, status, codigo) {
    const erro = new Error(mensagem)

    erro.status = status
    erro.codigo = codigo

    return erro
}

//Confirma que a operação está sendo executada por uma titular válida.
function validarTitular(titularId, papel) {
    if (!Number.isInteger(titularId) || titularId <= 0) {
        throw criarErro('Sua sessão é inválida.', 401, 'SESSAO_INVALIDA')
    }

    if (!PAPEIS_TITULAR.includes(papel)) {
        throw criarErro('Somente a titular pode criar categorias de permissão.', 403, 'ACAO_NAO_PERMITIDA')
    }
}

//Confirma novamente os dados essenciais antes de qualquer acesso ao banco.
function validarDadosDaCategoria(nome, dadosVisiveis) {
    if (typeof nome !== 'string' || nome.trim().length === 0) {
        throw criarErro('Dê um nome para a categoria.', 422, 'NOME_CATEGORIA_OBRIGATORIO')
    }

    if (!Array.isArray(dadosVisiveis) || dadosVisiveis.length === 0) {
        throw criarErro('Selecione ao menos um tipo de dado que esta categoria poderá visualizar.', 422, 'PERMISSAO_CATEGORIA_OBRIGATORIA')
    }

    if (dadosVisiveis.some(permissao => !permissaoCategoriaEhValida(permissao))) {
        throw criarErro('A seleção contém permissões inválidas.', 422, 'PERMISSAO_CATEGORIA_INVALIDA')
    }
}

//Cria a versão usada pela restrição única do banco.
function normalizarNomeParaComparacao(nome) {
    return nome.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('pt-BR')
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
    }
}

function criarPermissionCategoryService({prisma}) {
    //Cria uma categoria sem aceitar titularId ou quantidade de contatos vindos do cliente.
    async function criarCategoria({titularId, papel, nome, dadosVisiveis}) {
        validarTitular(titularId, papel)
        validarDadosDaCategoria(nome, dadosVisiveis)

        const nomeNormalizado = normalizarNomeParaComparacao(nome)
        const permissoesOrdenadas = ordenarPermissoesCategoria(dadosVisiveis)

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
            })

            return formatarCategoria(categoria)
        } catch (erro) {
            if (erro.code === 'P2002') {
                throw criarErro('Você já tem uma categoria com esse nome.', 409, 'CATEGORIA_NOME_DUPLICADO')
            }

            throw erro
        }
    }

    return {
        criarCategoria
    }
}

export { criarPermissionCategoryService }