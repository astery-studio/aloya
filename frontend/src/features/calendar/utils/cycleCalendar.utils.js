//Transforma os dados mensais da API em semanas prontas para renderização.
const NOMES_MESES = Object.freeze([
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
])

const TIPOS_DIA = Object.freeze({
    menstruacao: 'menstruacao',
    folicular: 'folicular',
    ovulacao: 'ovulacao',
    lutea: 'lutea'
})

const FORMATO_MES = /^(\d{4})-(0[1-9]|1[0-2])$/
const FORMATO_DATA = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

function preencherNumero(numero, tamanho = 2) {
    return String(numero).padStart(tamanho, '0')
}

function obterHojeLocal(data = new Date()) {
    return [
        preencherNumero(data.getFullYear(), 4),
        preencherNumero(data.getMonth() + 1),
        preencherNumero(data.getDate())
    ].join('-')
}

function interpretarMes(chaveMes) {
    const correspondencia = typeof chaveMes === 'string'
        ? FORMATO_MES.exec(chaveMes)
        : null

    if (!correspondencia) return null

    return {
        chave: chaveMes,
        ano: Number(correspondencia[1]),
        mes: Number(correspondencia[2])
    }
}

function criarDataUtc(ano, indiceMes, dia) {
    const data = new Date(0)
    data.setUTCHours(0, 0, 0, 0)
    data.setUTCFullYear(ano, indiceMes, dia)
    return data
}

function obterQuantidadeDias(ano, mes) {
    const primeiroDiaMesSeguinte = criarDataUtc(ano, mes, 1)
    const ultimoDia = new Date(primeiroDiaMesSeguinte.getTime() - 86_400_000)

    return ultimoDia.getUTCDate()
}

function criarCasasDoMes({ano, mes}) {
    const primeiroDiaDaSemana = criarDataUtc(ano, mes - 1, 1).getUTCDay()
    const quantidadeDias = obterQuantidadeDias(ano, mes)
    const casas = Array(primeiroDiaDaSemana).fill(null)

    for (let dia = 1; dia <= quantidadeDias; dia += 1) {
        casas.push({
            dia,
            data: `${preencherNumero(ano, 4)}-${preencherNumero(mes)}-${preencherNumero(dia)}`
        })
    }

    while (casas.length % 7 !== 0) casas.push(null)

    return casas
}

function intervaloContem(intervalo, data) {
    return Boolean(
        intervalo
        && typeof intervalo.inicio === 'string'
        && typeof intervalo.fim === 'string'
        && FORMATO_DATA.test(intervalo.inicio)
        && FORMATO_DATA.test(intervalo.fim)
        && data >= intervalo.inicio
        && data <= intervalo.fim
    )
}

function criarRegistrosPorData(diasMenstruacao) {
    const registros = new Map()

    if (!Array.isArray(diasMenstruacao)) return registros

    for (const dia of diasMenstruacao) {
        const dataValida = typeof dia?.data === 'string' && FORMATO_DATA.test(dia.data)
        const idValido = Number.isSafeInteger(dia?.registroCicloId) && dia.registroCicloId > 0

        if (dataValida && idValido) registros.set(dia.data, dia.registroCicloId)
    }

    return registros
}

function obterMarcacao(data, previsao, registroCicloId) {
    if (registroCicloId) {
        return {
            tipo: TIPOS_DIA.menstruacao,
            previsto: false
        }
    }

    if (intervaloContem(previsao?.menstruacaoPrevista, data)) {
        return {
            tipo: TIPOS_DIA.menstruacao,
            previsto: true
        }
    }

    if (intervaloContem(previsao?.faseMenstrual, data)) {
        return {
            tipo: TIPOS_DIA.menstruacao,
            previsto: false
        }
    }

    if (intervaloContem(previsao?.faseFolicular, data)) {
        return {
            tipo: TIPOS_DIA.folicular,
            previsto: false
        }
    }

    if (previsao?.ovulacao === data) {
        return {
            tipo: TIPOS_DIA.ovulacao,
            previsto: false
        }
    }

    if (intervaloContem(previsao?.faseLutea, data)) {
        return {
            tipo: TIPOS_DIA.lutea,
            previsto: false
        }
    }

    return {
        tipo: null,
        previsto: false
    }
}

function criarDia(casa, contexto) {
    if (!casa) return null

    const registroCicloId = contexto.registrosPorData.get(casa.data) ?? null
    const marcacao = obterMarcacao(casa.data, contexto.previsao, registroCicloId)
    const futuro = casa.data > contexto.hoje
    const previsto = Boolean(marcacao.tipo && (marcacao.previsto || futuro))
    const janelaFertil = intervaloContem(contexto.previsao?.janelaFertil, casa.data)

    return {
        ...casa,
        tipo: marcacao.tipo,
        previsto,
        futuro,
        registroCicloId,
        janelaFertil,
        janelaFertilPrevista: janelaFertil && futuro
    }
}

function obterChaveSegmento(dia) {
    return dia?.tipo ?? null
}

function prepararSegmentos(semana) {
    return semana.map((dia, indice) => {
        if (!dia) return null

        const chave = obterChaveSegmento(dia)
        const chaveAnterior = obterChaveSegmento(semana[indice - 1])
        const chaveSeguinte = obterChaveSegmento(semana[indice + 1])

        return {
            ...dia,
            inicioSegmento: Boolean(chave && chave !== chaveAnterior),
            fimSegmento: Boolean(chave && chave !== chaveSeguinte)
        }
    })
}

function dividirEmSemanas(dias) {
    const semanas = []

    for (let indice = 0; indice < dias.length; indice += 7) {
        semanas.push(prepararSegmentos(dias.slice(indice, indice + 7)))
    }

    return semanas
}

function normalizarMes(mesRecebido, hoje = obterHojeLocal()) {
    const mes = mesRecebido?.calendario ?? mesRecebido
    const periodo = interpretarMes(mes?.mes)

    if (!periodo || typeof hoje !== 'string' || !FORMATO_DATA.test(hoje)) return null

    const contexto = {
        hoje,
        previsao: mes.previsao ?? null,
        registrosPorData: criarRegistrosPorData(mes.diasMenstruacao)
    }

    const dias = criarCasasDoMes(periodo).map((casa) => criarDia(casa, contexto))

    return {
        chave: periodo.chave,
        ano: periodo.ano,
        mes: periodo.mes,
        titulo: `${NOMES_MESES[periodo.mes - 1]} ${periodo.ano}`,
        possuiCiclos: mes.possuiCiclos === true,
        semanas: dividirEmSemanas(dias)
    }
}

function normalizarMeses(meses, hoje = obterHojeLocal()) {
    if (!Array.isArray(meses)) return []

    const mesesNormalizados = new Map()

    for (const mes of meses) {
        const normalizado = normalizarMes(mes, hoje)
        if (normalizado) mesesNormalizados.set(normalizado.chave, normalizado)
    }

    return [...mesesNormalizados.values()].sort((a, b) => a.chave.localeCompare(b.chave))
}

export {
    NOMES_MESES,
    TIPOS_DIA,
    normalizarMes,
    normalizarMeses,
    obterHojeLocal
}