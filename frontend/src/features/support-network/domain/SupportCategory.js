//Define o formato seguro de uma categoria da Rede de Apoio recebida da API.
import {gruposPermissoes, permissoesGerais} from '../constants/permissionOptions'

const mensagemRespostaInvalida = 'Não foi possível carregar a categoria de permissão.'

const ordemDasPermissoes = Object.freeze([
    ...permissoesGerais.map(permissao => permissao.id),
    ...gruposPermissoes.flatMap(grupo => grupo.permissoes.map(permissao => permissao.id))
])

const permissoesPermitidas = new Set(ordemDasPermissoes)

//Recebe um nome e confirma que ele está normalizado, dentro do limite e sem caracteres perigosos.
function nomeEhValido(nome) {
    if (typeof nome !== 'string') {
        return false
    }

    const nomeNormalizado = nome.normalize('NFKC').trim().replace(/\s+/gu, ' ')

    return nome === nomeNormalizado
        && nome.length > 0
        && [...nome].length <= 80
        && !/[\u0000-\u001F\u007F<>]/u.test(nome)
}

//Recebe uma data completa da API e confirma que ela existe no formato UTC esperado.
function dataHoraIsoEhValida(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(valor)) {
        return false
    }

    const data = new Date(valor)

    return !Number.isNaN(data.getTime()) && data.toISOString() === valor
}

//Recebe uma lista e devolve permissões únicas na ordem oficial da aplicação.
function normalizarPermissoes(permissoes) {
    if (!Array.isArray(permissoes) || permissoes.length === 0) {
        throw new Error(mensagemRespostaInvalida)
    }

    const possuiValorInvalido = permissoes.some(permissao => typeof permissao !== 'string' || !permissoesPermitidas.has(permissao))

    if (possuiValorInvalido) {
        throw new Error(mensagemRespostaInvalida)
    }

    const permissoesRecebidas = new Set(permissoes)
    return ordemDasPermissoes.filter(permissao => permissoesRecebidas.has(permissao))
}

//Recebe os dados brutos de uma categoria e retorna somente sua representação segura.
function criarSupportCategory(dados) {
    const estruturaValida = dados !== null
        && typeof dados === 'object'
        && !Array.isArray(dados)
        && Number.isSafeInteger(dados.id)
        && dados.id > 0
        && nomeEhValido(dados.nome)
        && Number.isSafeInteger(dados.quantidadeContatos)
        && dados.quantidadeContatos >= 0
        && dataHoraIsoEhValida(dados.criadoEm)
        && dataHoraIsoEhValida(dados.atualizadoEm)
        && dados.atualizadoEm >= dados.criadoEm

    if (!estruturaValida) {
        throw new Error(mensagemRespostaInvalida)
    }

    const dadosVisiveis = Object.freeze(normalizarPermissoes(dados.dadosVisiveis))

    return Object.freeze({
        id: dados.id,
        nome: dados.nome,
        dadosVisiveis,
        quantidadeContatos: dados.quantidadeContatos,
        criadoEm: dados.criadoEm,
        atualizadoEm: dados.atualizadoEm
    })
}

export {criarSupportCategory}