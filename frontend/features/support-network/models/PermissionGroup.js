//Define o formato seguro de um grupo de permissões usado pela Rede de Apoio.
import {gruposPermissoes} from '../constants/permissionOptions'

const mensagemGrupoInvalido = 'Não foi possível carregar o grupo de permissões.'
const gruposPorId = new Map(gruposPermissoes.map(grupo => [grupo.id, grupo]))

//Confirma que o valor recebido é um objeto simples e não uma lista ou objeto modificado.
function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
        return false
    }

    const prototipo = Object.getPrototypeOf(valor)
    return prototipo === Object.prototype || prototipo === null
}

//Recebe as permissões do grupo e devolve uma cópia segura na ordem oficial.
function criarPermissoesDoGrupo(permissoesRecebidas, configuracao) {
    if (!Array.isArray(permissoesRecebidas) || permissoesRecebidas.length !== configuracao.permissoes.length) {
        throw new Error(mensagemGrupoInvalido)
    }

    const permissoesPorId = new Map()

    for (const permissao of permissoesRecebidas) {
        if (!ehObjetoSimples(permissao) || typeof permissao.id !== 'string' || typeof permissao.titulo !== 'string' || permissoesPorId.has(permissao.id)) {
            throw new Error(mensagemGrupoInvalido)
        }

        permissoesPorId.set(permissao.id, permissao)
    }

    const permissoesValidas = configuracao.permissoes.every(permissaoEsperada => {
        const permissaoRecebida = permissoesPorId.get(permissaoEsperada.id)
        return permissaoRecebida?.titulo === permissaoEsperada.titulo
    })

    if (!permissoesValidas) {
        throw new Error(mensagemGrupoInvalido)
    }

    return Object.freeze(
        configuracao.permissoes.map(permissao => Object.freeze({
            id: permissao.id,
            titulo: permissao.titulo
        }))
    )
}

//Recebe um grupo bruto e retorna somente sua configuração segura e imutável.
function criarPermissionGroup(dados) {
    if (!ehObjetoSimples(dados) || typeof dados.id !== 'string') {
        throw new Error(mensagemGrupoInvalido)
    }

    const configuracao = gruposPorId.get(dados.id)

    const estruturaValida = configuracao
        && dados.titulo === configuracao.titulo
        && dados.icone === configuracao.icone
        && dados.paleta === configuracao.paleta

    if (!estruturaValida) {
        throw new Error(mensagemGrupoInvalido)
    }

    const permissoes = criarPermissoesDoGrupo(dados.permissoes, configuracao)

    return Object.freeze({
        id: configuracao.id,
        titulo: configuracao.titulo,
        icone: configuracao.icone,
        paleta: configuracao.paleta,
        permissoes
    })
}

export {criarPermissionGroup}