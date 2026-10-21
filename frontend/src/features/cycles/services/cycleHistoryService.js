//Busca páginas do histórico e converte a resposta segura da API para o formato visual.
import {endpoints} from '../../../shared/services/api/endpoints'

const LIMITE_PADRAO = 20
const LIMITE_MAXIMO = 50
const TAMANHO_MAXIMO_CURSOR = 256

const mesesAbreviados = Object.freeze([
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez'
])

const statusPermitidos = Object.freeze([
    'emAndamento',
    'concluido'
])

const classificacoesPermitidas = Object.freeze([
    'normal',
    'atipico',
    'irregular'
])

const confiancasPermitidas = Object.freeze([
    'baixa',
    'media',
    'alta'
])

//Confere se o valor recebido possui somente uma estrutura comum de objeto.
function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
        return false
    }

    const prototipo = Object.getPrototypeOf(valor)

    return prototipo === Object.prototype || prototipo === null
}

//Cria um erro amigável sem incluir dados menstruais na mensagem.
function criarErroResposta() {
    const erro = new Error('Não foi possível interpretar o histórico de ciclos.')
    erro.codigo = 'RESPOSTA_HISTORICO_INVALIDA'
    erro.mensagemUsuario = erro.message
    return erro
}

//Confere se uma data usa o formato YYYY-MM-DD e realmente existe.
function dataIsoEhValida(valor) {
    if (typeof valor !== 'string') {
        return false
    }

    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)

    if (!partes) {
        return false
    }

    const ano = Number(partes[1])
    const mes = Number(partes[2])
    const dia = Number(partes[3])
    const data = new Date(Date.UTC(ano, mes - 1, dia))

    return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia
}

//Transforma uma data ISO em texto curto sem alteração de fuso.
function formatarDataCurta(dataIso) {
    const [, , mes, dia] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso)
    return `${dia} ${mesesAbreviados[Number(mes) - 1]}`
}

//Cria o período exibido no card.
function criarPeriodo(dataInicio, dataFim) {
    const inicio = formatarDataCurta(dataInicio)
    const fim = dataFim === null ? 'hoje' : formatarDataCurta(dataFim)
    return `${inicio} até ${fim}`
}

//Confere se uma duração opcional é um número inteiro válido.
function duracaoEhValida(valor) {
    return valor === null || (Number.isSafeInteger(valor) && valor > 0)
}

//Confere uma métrica opcional do resumo.
function metricaResumoEhValida(valor) {
    return valor === null || (Number.isSafeInteger(valor) && valor > 0)
}

//Valida e congela o resumo calculado pelo backend.
function normalizarResumo(resumo, quantidadeCiclos) {
    const valido = ehObjetoSimples(resumo)
        && metricaResumoEhValida(resumo.cicloMedioDias)
        && metricaResumoEhValida(resumo.menstruacaoMediaDias)
        && resumo.quantidadeCiclos === quantidadeCiclos
        && confiancasPermitidas.includes(resumo.confianca)

    if (!valido) {
        throw criarErroResposta()
    }

    return Object.freeze({
        cicloMedioDias: resumo.cicloMedioDias,
        menstruacaoMediaDias: resumo.menstruacaoMediaDias,
        quantidadeCiclos: resumo.quantidadeCiclos,
        confianca: resumo.confianca
    })
}

//Valida e converte um ciclo da API.
function normalizarCicloHistorico(registro) {
    const valido = ehObjetoSimples(registro)
        && Number.isSafeInteger(registro.id)
        && registro.id > 0
        && Number.isSafeInteger(registro.numero)
        && registro.numero > 0
        && dataIsoEhValida(registro.dataInicio)
        && (registro.dataFim === null || dataIsoEhValida(registro.dataFim))
        && duracaoEhValida(registro.diasMenstruais)
        && duracaoEhValida(registro.duracaoDias)
        && statusPermitidos.includes(registro.status)
        && classificacoesPermitidas.includes(registro.classificacao)
        && typeof registro.estimativaIncerta === 'boolean'
        && typeof registro.cicloInicial === 'boolean'

    if (!valido) {
        throw criarErroResposta()
    }

    return Object.freeze({
        id: String(registro.id),
        numero: registro.numero,
        periodo: criarPeriodo(registro.dataInicio, registro.dataFim),
        dataInicio: registro.dataInicio,
        dataFim: registro.dataFim,
        diasMenstruais: registro.diasMenstruais,
        duracaoDias: registro.duracaoDias,
        status: registro.estimativaIncerta ? 'incerto' : registro.status,
        classificacao: registro.classificacao,
        estimativaIncerta: registro.estimativaIncerta,
        cicloInicial: registro.cicloInicial
    })
}

//Confere os argumentos de paginação antes de montar a URL.
function validarPaginacao(limite, cursor) {
    if (!Number.isSafeInteger(limite) || limite <= 0 || limite > LIMITE_MAXIMO) {
        throw new TypeError(`O limite deve ser um número inteiro entre 1 e ${LIMITE_MAXIMO}.`)
    }

    if (cursor !== null && (typeof cursor !== 'string' || !cursor || cursor.length > TAMANHO_MAXIMO_CURSOR || !/^[A-Za-z0-9_-]+$/.test(cursor))) {
        throw new TypeError('O cursor do histórico é inválido.')
    }
}

//Monta o caminho da página sem aceitar parâmetros arbitrários.
function criarCaminhoHistorico(limite, cursor) {
    const caminho = `${endpoints.historicoCiclos}?limit=${limite}`
    return cursor === null ? caminho : `${caminho}&cursor=${encodeURIComponent(cursor)}`
}

//Valida o envelope da API e congela a página.
function normalizarPagina(resposta, limiteSolicitado) {
    if (!ehObjetoSimples(resposta) || !Array.isArray(resposta.ciclos) || !Number.isSafeInteger(resposta.quantidadeCiclos) || resposta.quantidadeCiclos < 0 || !ehObjetoSimples(resposta.paginacao)) {
        throw criarErroResposta()
    }

    const paginacao = resposta.paginacao
    const paginacaoValida = paginacao.limite === limiteSolicitado
        && typeof paginacao.temMais === 'boolean'
        && ((paginacao.temMais && typeof paginacao.proximoCursor === 'string' && Boolean(paginacao.proximoCursor)) || (!paginacao.temMais && paginacao.proximoCursor === null))

    if (!paginacaoValida || resposta.ciclos.length > limiteSolicitado || resposta.ciclos.length > resposta.quantidadeCiclos) {
        throw criarErroResposta()
    }

    const ciclos = Object.freeze(resposta.ciclos.map(normalizarCicloHistorico))
    const resumo = normalizarResumo(resposta.resumo, resposta.quantidadeCiclos)

    return Object.freeze({
        ciclos,
        resumo,
        quantidadeCiclos: resposta.quantidadeCiclos,
        paginacao: Object.freeze({
            limite: paginacao.limite,
            temMais: paginacao.temMais,
            proximoCursor: paginacao.proximoCursor
        })
    })
}

//Cria o serviço autenticado responsável pelo carregamento incremental.
function criarCycleHistoryService({requisicaoAutenticada} = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço do histórico de ciclos.')
    }

    //Carrega uma página e preserva o sinal de cancelamento.
    async function listarPagina({limite = LIMITE_PADRAO, cursor = null, signal} = {}) {
        validarPaginacao(limite, cursor)

        const resposta = await requisicaoAutenticada({
            caminho: criarCaminhoHistorico(limite, cursor),
            ...(signal ? {signal} : {})
        })

        return normalizarPagina(resposta, limite)
    }

    return Object.freeze({
        listarPagina
    })
}

export {
    criarCycleHistoryService,
    normalizarCicloHistorico
}