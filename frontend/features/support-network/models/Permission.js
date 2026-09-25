//Define o formato seguro de uma permissão individual da Rede de Apoio.
import {gruposPermissoes, permissoesGerais} from '../constants/permissionOptions'

const mensagemPermissaoInvalida = 'Não foi possível carregar a permissão.'

const permissoesPorId = new Map([
    ...permissoesGerais,
    ...gruposPermissoes.flatMap(grupo => grupo.permissoes)
].map(permissao => [permissao.id, permissao]))

//Confirma que o valor recebido é um objeto simples e não uma lista ou objeto modificado.
function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
        return false
    }

    const prototipo = Object.getPrototypeOf(valor)
    return prototipo === Object.prototype || prototipo === null
}

//Recebe os dados brutos de uma permissão e retorna somente sua representação segura.
function criarPermission(dados) {
    if (!ehObjetoSimples(dados) || typeof dados.id !== 'string') {
        throw new Error(mensagemPermissaoInvalida)
    }

    const configuracao = permissoesPorId.get(dados.id)

    const estruturaValida = configuracao
        && dados.titulo === configuracao.titulo
        && typeof dados.ativo === 'boolean'

    if (!estruturaValida) {
        throw new Error(mensagemPermissaoInvalida)
    }

    return Object.freeze({
        id: configuracao.id,
        titulo: configuracao.titulo,
        ativo: dados.ativo
    })
}

export {criarPermission}