//Envia categorias de permissão para a API e valida a resposta antes de usá-la.
import {endpoints} from '../../../services/api/endpoints'
import {gruposPermissoes, permissoesGerais} from '../constants/permissionOptions'
import {criarSupportCategory} from '../models/SupportCategory'

const ordemDasPermissoes = Object.freeze([
    ...permissoesGerais.map(permissao => permissao.id),
    ...gruposPermissoes.flatMap(grupo => grupo.permissoes.map(permissao => permissao.id))
])

const permissoesPermitidas = new Set(ordemDasPermissoes)

//Confirma que o valor recebido é um objeto simples e não uma lista ou objeto modificado.
function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
        return false
    }

    const prototipo = Object.getPrototypeOf(valor)
    return prototipo === Object.prototype || prototipo === null
}

//Cria um erro local controlado sem incluir os dados preenchidos pela pessoa usuária.
function criarErroLocal(mensagem, codigo) {
    const erro = new Error(mensagem)
    erro.codigo = codigo
    erro.mensagemUsuario = mensagem
    return erro
}

//Valida, normaliza e limita os únicos campos permitidos na criação.
function prepararDadosCategoria(dados) {
    if (!ehObjetoSimples(dados)) {
        throw criarErroLocal('Os dados da categoria são inválidos.', 'DADOS_CATEGORIA_INVALIDOS')
    }

    const camposRecebidos = Object.keys(dados)
    const camposPermitidos = ['nome', 'dadosVisiveis']
    const possuiCampoProibido = camposRecebidos.some(campo => !camposPermitidos.includes(campo))

    if (possuiCampoProibido || camposRecebidos.length !== camposPermitidos.length || typeof dados.nome !== 'string' || !Array.isArray(dados.dadosVisiveis)) {
        throw criarErroLocal('Os dados da categoria são inválidos.', 'DADOS_CATEGORIA_INVALIDOS')
    }

    const nome = dados.nome.normalize('NFKC').trim().replace(/\s+/gu, ' ')

    const nomeInvalido = nome.length === 0
        || [...nome].length > 80
        || /[\u0000-\u001F\u007F<>]/u.test(nome)

    const permissoesInvalidas = dados.dadosVisiveis.length === 0
        || dados.dadosVisiveis.length > ordemDasPermissoes.length
        || dados.dadosVisiveis.some(permissao => typeof permissao !== 'string' || !permissoesPermitidas.has(permissao))

    if (nomeInvalido || permissoesInvalidas) {
        throw criarErroLocal('Os dados da categoria são inválidos.', 'DADOS_CATEGORIA_INVALIDOS')
    }

    const permissoesRecebidas = new Set(dados.dadosVisiveis)
    const dadosVisiveis = Object.freeze(ordemDasPermissoes.filter(permissao => permissoesRecebidas.has(permissao)))

    return Object.freeze({
        nome,
        dadosVisiveis
    })
}

//Recebe a requisição autenticada e devolve as operações de categorias da Rede de Apoio.
function criarSupportCategoryService({requisicaoAutenticada}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço de categorias.')
    }

    let criacaoEmAndamento = null
    let chaveDaCriacao = null

    //Cria uma categoria protegida e impede o envio duplicado da mesma solicitação.
    function criarCategoria(dados) {
        const dadosSeguros = prepararDadosCategoria(dados)
        const chaveAtual = JSON.stringify(dadosSeguros)

        if (criacaoEmAndamento) {
            if (chaveAtual === chaveDaCriacao) {
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

        criacaoEmAndamento = requisicaoAutenticada({
            metodo: 'POST',
            caminho: endpoints.categoriasPermissao,
            corpo: dadosSeguros
        }).then(resposta => criarSupportCategory(resposta?.categoria)).finally(() => {
            criacaoEmAndamento = null
            chaveDaCriacao = null
        })

        return criacaoEmAndamento
    }

    return Object.freeze({
        criarCategoria
    })
}

export {criarSupportCategoryService}