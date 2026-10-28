//Cria, lista e edita categorias de permissão usando a sessão autenticada.
import {
    endpoints
} from '../../../shared/services/api/endpoints'
import {
    gruposPermissoes,
    permissoesGerais
} from '../constants/permissionOptions'
import {
    criarSupportCategory
} from '../domain/SupportCategory'

const MENSAGEM_LISTAGEM_INVALIDA =
    'Não foi possível carregar suas categorias no momento. Tente novamente.'

const ordemDasPermissoes = Object.freeze([
    ...permissoesGerais.map(
        permissao => permissao.id
    ),
    ...gruposPermissoes.flatMap(
        grupo =>
            grupo.permissoes.map(
                permissao =>
                    permissao.id
            )
    )
])

const permissoesPermitidas =
    new Set(ordemDasPermissoes)

//Confirma que o valor recebido é um objeto simples e não uma lista ou objeto modificado.
function ehObjetoSimples(valor) {
    if (
        valor === null
        || typeof valor !== 'object'
        || Array.isArray(valor)
    ) {
        return false
    }

    const prototipo =
        Object.getPrototypeOf(valor)

    return prototipo === Object.prototype
        || prototipo === null
}

//Cria um erro local controlado sem incluir dados privados ou respostas internas.
function criarErroLocal(
    mensagem,
    codigo
) {
    const erro = new Error(mensagem)

    erro.codigo = codigo
    erro.mensagemUsuario = mensagem

    return erro
}

//Valida o identificador positivo usado no caminho da edição.
function validarCategoriaId(categoriaId) {
    if (
        !Number.isSafeInteger(categoriaId)
        || categoriaId <= 0
    ) {
        throw criarErroLocal(
            'O identificador da categoria é inválido.',
            'ID_CATEGORIA_INVALIDO'
        )
    }

    return categoriaId
}

//Valida uma data completa no formato UTC esperado pelo backend.
function validarAtualizadoEm(atualizadoEm) {
    if (
        typeof atualizadoEm !== 'string'
        || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u
            .test(atualizadoEm)
    ) {
        throw criarErroLocal(
            'A versão da categoria é inválida.',
            'VERSAO_CATEGORIA_INVALIDA'
        )
    }

    const data = new Date(atualizadoEm)

    if (
        Number.isNaN(data.getTime())
        || data.toISOString() !== atualizadoEm
    ) {
        throw criarErroLocal(
            'A versão da categoria é inválida.',
            'VERSAO_CATEGORIA_INVALIDA'
        )
    }

    return atualizadoEm
}

//Valida a quantidade enviada ao confirmar o impacto da alteração.
function validarQuantidadeConfirmada(
    quantidadeContatosConfirmada
) {
    if (
        quantidadeContatosConfirmada
        === undefined
    ) {
        return undefined
    }

    if (
        !Number.isSafeInteger(
            quantidadeContatosConfirmada
        )
        || quantidadeContatosConfirmada < 0
    ) {
        throw criarErroLocal(
            'A confirmação de impacto é inválida.',
            'CONFIRMACAO_IMPACTO_INVALIDA'
        )
    }

    return quantidadeContatosConfirmada
}

//Valida, normaliza e limita os únicos campos editáveis de uma categoria.
function prepararDadosCategoria(dados) {
    if (!ehObjetoSimples(dados)) {
        throw criarErroLocal(
            'Os dados da categoria são inválidos.',
            'DADOS_CATEGORIA_INVALIDOS'
        )
    }

    const camposRecebidos =
        Object.keys(dados)

    const camposPermitidos = [
        'nome',
        'dadosVisiveis'
    ]

    const possuiCampoProibido =
        camposRecebidos.some(
            campo =>
                !camposPermitidos.includes(
                    campo
                )
        )

    if (
        possuiCampoProibido
        || camposRecebidos.length
            !== camposPermitidos.length
        || typeof dados.nome !== 'string'
        || !Array.isArray(
            dados.dadosVisiveis
        )
    ) {
        throw criarErroLocal(
            'Os dados da categoria são inválidos.',
            'DADOS_CATEGORIA_INVALIDOS'
        )
    }

    const nome = dados.nome
        .normalize('NFKC')
        .trim()
        .replace(/\s+/gu, ' ')

    const nomeInvalido =
        nome.length === 0
        || [...nome].length > 80
        || /[\u0000-\u001F\u007F<>]/u
            .test(nome)

    const permissoesInvalidas =
        dados.dadosVisiveis.length === 0
        || dados.dadosVisiveis.length
            > ordemDasPermissoes.length
        || dados.dadosVisiveis.some(
            permissao =>
                typeof permissao
                    !== 'string'
                || !permissoesPermitidas
                    .has(permissao)
        )

    if (
        nomeInvalido
        || permissoesInvalidas
    ) {
        throw criarErroLocal(
            'Os dados da categoria são inválidos.',
            'DADOS_CATEGORIA_INVALIDOS'
        )
    }

    const permissoesRecebidas =
        new Set(dados.dadosVisiveis)

    const dadosVisiveis =
        Object.freeze(
            ordemDasPermissoes.filter(
                permissao =>
                    permissoesRecebidas
                        .has(permissao)
            )
        )

    return Object.freeze({
        nome,
        dadosVisiveis
    })
}

//Prepara a substituição completa da categoria e preserva sua versão original.
function prepararEdicaoCategoria(
    categoriaId,
    dados
) {
    const id =
        validarCategoriaId(categoriaId)

    if (!ehObjetoSimples(dados)) {
        throw criarErroLocal(
            'Os dados da categoria são inválidos.',
            'DADOS_CATEGORIA_INVALIDOS'
        )
    }

    const camposPermitidos = new Set([
        'nome',
        'dadosVisiveis',
        'atualizadoEm',
        'quantidadeContatosConfirmada'
    ])

    const camposRecebidos =
        Object.keys(dados)

    const possuiCampoProibido =
        camposRecebidos.some(
            campo =>
                !camposPermitidos.has(campo)
        )

    if (possuiCampoProibido) {
        throw criarErroLocal(
            'Os dados da categoria são inválidos.',
            'DADOS_CATEGORIA_INVALIDOS'
        )
    }

    const categoria =
        prepararDadosCategoria({
            nome: dados.nome,
            dadosVisiveis:
                dados.dadosVisiveis
        })

    const atualizadoEm =
        validarAtualizadoEm(
            dados.atualizadoEm
        )

    const quantidadeContatosConfirmada =
        validarQuantidadeConfirmada(
            dados.quantidadeContatosConfirmada
        )

    const corpo = {
        nome: categoria.nome,
        dadosVisiveis:
            categoria.dadosVisiveis,
        atualizadoEm
    }

    if (
        quantidadeContatosConfirmada
        !== undefined
    ) {
        corpo.quantidadeContatosConfirmada =
            quantidadeContatosConfirmada
    }

    return Object.freeze({
        categoriaId: id,
        corpo: Object.freeze(corpo)
    })
}

//Valida todos os itens da listagem e remove campos que não pertencem ao contrato público.
function prepararListaCategorias(
    resposta
) {
    if (!Array.isArray(resposta?.categorias)) {
        throw criarErroLocal(
            MENSAGEM_LISTAGEM_INVALIDA,
            'RESPOSTA_CATEGORIAS_INVALIDA'
        )
    }

    try {
        const categorias =
            resposta.categorias.map(
                categoria =>
                    criarSupportCategory(
                        categoria
                    )
            )

        return Object.freeze(categorias)
    } catch {
        throw criarErroLocal(
            MENSAGEM_LISTAGEM_INVALIDA,
            'RESPOSTA_CATEGORIAS_INVALIDA'
        )
    }
}

//Recebe a requisição autenticada e devolve as operações de categorias da Rede de Apoio.
function criarSupportCategoryService({
    requisicaoAutenticada
} = {}) {
    if (
        typeof requisicaoAutenticada
            !== 'function'
    ) {
        throw new Error(
            'Não foi possível configurar o serviço de categorias.'
        )
    }

    let criacaoEmAndamento = null
    let chaveDaCriacao = null

    const edicoesEmAndamento =
        new Map()

    //Busca somente as categorias pertencentes à sessão autenticada.
    async function listarCategorias({
        signal
    } = {}) {
        const opcoes = {
            metodo: 'GET',
            caminho:
                endpoints.categoriasPermissao
        }

        if (signal !== undefined) {
            opcoes.signal = signal
        }

        const resposta =
            await requisicaoAutenticada(
                opcoes
            )

        return prepararListaCategorias(
            resposta
        )
    }

    //Cria uma categoria protegida e impede o envio duplicado da mesma solicitação.
    function criarCategoria(dados) {
        const dadosSeguros =
            prepararDadosCategoria(dados)

        const chaveAtual =
            JSON.stringify(dadosSeguros)

        if (criacaoEmAndamento) {
            if (
                chaveAtual
                === chaveDaCriacao
            ) {
                return criacaoEmAndamento
            }

            return Promise.reject(
                criarErroLocal(
                    'Aguarde a criação da categoria atual.',
                    'CRIACAO_CATEGORIA_EM_ANDAMENTO'
                )
            )
        }

        chaveDaCriacao = chaveAtual

        criacaoEmAndamento =
            requisicaoAutenticada({
                metodo: 'POST',
                caminho:
                    endpoints
                        .categoriasPermissao,
                corpo: dadosSeguros
            })
                .then(resposta =>
                    criarSupportCategory(
                        resposta?.categoria
                    )
                )
                .finally(() => {
                    criacaoEmAndamento =
                        null

                    chaveDaCriacao = null
                })

        return criacaoEmAndamento
    }

    //Substitui os dados editáveis e impede duas alterações concorrentes na mesma categoria.
    function editarCategoria(
        categoriaId,
        dados
    ) {
        const edicao =
            prepararEdicaoCategoria(
                categoriaId,
                dados
            )

        const chaveAtual =
            JSON.stringify(edicao.corpo)

        const edicaoAtual =
            edicoesEmAndamento.get(
                edicao.categoriaId
            )

        if (edicaoAtual) {
            if (
                edicaoAtual.chave
                === chaveAtual
            ) {
                return edicaoAtual.promessa
            }

            return Promise.reject(
                criarErroLocal(
                    'Aguarde a atualização atual da categoria.',
                    'EDICAO_CATEGORIA_EM_ANDAMENTO'
                )
            )
        }

        let promessa

        promessa =
            requisicaoAutenticada({
                metodo: 'PUT',
                caminho:
                    `${endpoints.categoriasPermissao}/${edicao.categoriaId}`,
                corpo: edicao.corpo
            })
                .then(resposta =>
                    criarSupportCategory(
                        resposta?.categoria
                    )
                )
                .finally(() => {
                    const operacaoAtual =
                        edicoesEmAndamento.get(
                            edicao.categoriaId
                        )

                    if (
                        operacaoAtual?.promessa
                        === promessa
                    ) {
                        edicoesEmAndamento.delete(
                            edicao.categoriaId
                        )
                    }
                })

        edicoesEmAndamento.set(
            edicao.categoriaId,
            {
                chave: chaveAtual,
                promessa
            }
        )

        return promessa
    }

    return Object.freeze({
        criarCategoria,
        editarCategoria,
        listarCategorias
    })
}

export {
    criarSupportCategoryService
}