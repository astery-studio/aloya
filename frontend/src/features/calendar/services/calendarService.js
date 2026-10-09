//Busca dados mensais do calendário usando a sessão autenticada.
import {endpoints} from '../../../shared/services/api/endpoints'

const FORMATO_MES = /^\d{4}-(0[1-9]|1[0-2])$/
const FORMATO_DATA = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const MENSAGEM_ERRO = 'Não foi possível carregar os dados do calendário. Tente novamente.'

function criarErroLocal(mensagem, codigo) {
    const erro = new Error(mensagem)
    erro.codigo = codigo
    erro.mensagemUsuario = mensagem
    return erro
}

function ehObjeto(valor) {
    return valor !== null
        && typeof valor === 'object'
        && !Array.isArray(valor)
}

function validarMes(mes) {
    if (typeof mes !== 'string' || !FORMATO_MES.test(mes)) {
        throw criarErroLocal(
            'Informe o mês no formato AAAA-MM.',
            'MES_CALENDARIO_INVALIDO'
        )
    }
}

function respostaMensalEhValida(calendario, mesSolicitado) {
    if (
        !ehObjeto(calendario)
        || calendario.mes !== mesSolicitado
        || typeof calendario.possuiCiclos !== 'boolean'
        || !Array.isArray(calendario.diasMenstruacao)
        || (calendario.previsao !== null && !ehObjeto(calendario.previsao))
    ) {
        return false
    }

    return calendario.diasMenstruacao.every(dia => (
        ehObjeto(dia)
        && typeof dia.data === 'string'
        && FORMATO_DATA.test(dia.data)
        && Number.isSafeInteger(dia.registroCicloId)
        && dia.registroCicloId > 0
    ))
}

function criarCalendarService({requisicaoAutenticada} = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço do calendário.')
    }

    async function buscarMes({mes, signal} = {}) {
        validarMes(mes)

        const resposta = await requisicaoAutenticada({
            caminho: `${endpoints.calendario}?mes=${encodeURIComponent(mes)}`,
            signal
        })

        if (!respostaMensalEhValida(resposta?.calendario, mes)) {
            throw criarErroLocal(MENSAGEM_ERRO, 'RESPOSTA_CALENDARIO_INVALIDA')
        }

        return resposta.calendario
    }

    return Object.freeze({buscarMes})
}

export {criarCalendarService}