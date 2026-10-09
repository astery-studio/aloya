//Permite validar visualmente o calendário antes da integração com a API.
import {useCallback, useEffect, useRef, useState} from 'react'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {CycleCalendar} from '../components/CycleCalendar/CycleCalendar'

function criarData(chaveMes, dia) {
    return `${chaveMes}-${String(dia).padStart(2, '0')}`
}

function criarDiasMenstruacao(chaveMes, inicio, fim, registroCicloId) {
    return Array.from({length: fim - inicio + 1}, (_, indice) => ({
        data: criarData(chaveMes, inicio + indice),
        registroCicloId
    }))
}

function criarMesHistorico(chaveMes, registroCicloId, inicioMenstruacao = 4) {
    const fimMenstruacao = inicioMenstruacao + 3

    return {
        mes: chaveMes,
        possuiCiclos: true,
        diasMenstruacao: criarDiasMenstruacao(chaveMes, inicioMenstruacao, fimMenstruacao, registroCicloId),
        previsao: {
            faseMenstrual: {
                inicio: criarData(chaveMes, inicioMenstruacao),
                fim: criarData(chaveMes, fimMenstruacao)
            },
            faseFolicular: {
                inicio: criarData(chaveMes, fimMenstruacao + 1),
                fim: criarData(chaveMes, 17)
            },
            ovulacao: criarData(chaveMes, 18),
            faseLutea: {
                inicio: criarData(chaveMes, 19),
                fim: criarData(chaveMes, 28)
            },
            janelaFertil: {
                inicio: criarData(chaveMes, 13),
                fim: criarData(chaveMes, 19)
            },
            menstruacaoPrevista: null
        }
    }
}

function criarMesFuturo(chaveMes) {
    return {
        mes: chaveMes,
        possuiCiclos: true,
        diasMenstruacao: [],
        previsao: {
            faseMenstrual: null,
            faseFolicular: {
                inicio: criarData(chaveMes, 8),
                fim: criarData(chaveMes, 17)
            },
            ovulacao: criarData(chaveMes, 18),
            faseLutea: {
                inicio: criarData(chaveMes, 19),
                fim: criarData(chaveMes, 28)
            },
            janelaFertil: {
                inicio: criarData(chaveMes, 13),
                fim: criarData(chaveMes, 19)
            },
            menstruacaoPrevista: {
                inicio: criarData(chaveMes, 4),
                fim: criarData(chaveMes, 7)
            }
        }
    }
}

const MESES_INICIAIS = Object.freeze([
    criarMesHistorico('2026-08', 108, 7),
    criarMesHistorico('2026-09', 109, 4),
    criarMesHistorico('2026-10', 110, 4)
])

const MESES_ANTERIORES = Object.freeze([
    criarMesHistorico('2026-07', 107),
    criarMesHistorico('2026-06', 106, 6),
    criarMesHistorico('2026-05', 105, 8)
])

const MESES_POSTERIORES = Object.freeze([
    criarMesFuturo('2026-11'),
    criarMesFuturo('2026-12'),
    criarMesFuturo('2027-01')
])

function CycleCalendarTestScreen({onSelecionarAba}) {
    const [meses, setMeses] = useState(MESES_INICIAIS)
    const [indiceAnterior, setIndiceAnterior] = useState(0)
    const [indicePosterior, setIndicePosterior] = useState(0)
    const [carregandoAnteriores, setCarregandoAnteriores] = useState(false)
    const [carregandoPosteriores, setCarregandoPosteriores] = useState(false)
    const temporizadorAnterior = useRef(null)
    const temporizadorPosterior = useRef(null)

    useEffect(() => () => {
        clearTimeout(temporizadorAnterior.current)
        clearTimeout(temporizadorPosterior.current)
    }, [])

    const carregarAnteriores = useCallback(() => {
        const proximoMes = MESES_ANTERIORES[indiceAnterior]

        if (!proximoMes || carregandoAnteriores) return

        setCarregandoAnteriores(true)

        temporizadorAnterior.current = setTimeout(() => {
            setMeses((mesesAtuais) => [proximoMes, ...mesesAtuais])
            setIndiceAnterior((indiceAtual) => indiceAtual + 1)
            setCarregandoAnteriores(false)
        }, 100)
    }, [carregandoAnteriores, indiceAnterior])

    const carregarPosteriores = useCallback(() => {
        const proximoMes = MESES_POSTERIORES[indicePosterior]

        if (!proximoMes || carregandoPosteriores) return

        setCarregandoPosteriores(true)

        temporizadorPosterior.current = setTimeout(() => {
            setMeses((mesesAtuais) => [...mesesAtuais, proximoMes])
            setIndicePosterior((indiceAtual) => indiceAtual + 1)
            setCarregandoPosteriores(false)
        }, 700)
    }, [carregandoPosteriores, indicePosterior])

    return (
        <MainLayout titulo="Calendário" abaAtiva="diario" onSelecionarAba={onSelecionarAba}>
            <CycleCalendar
                meses={meses}
                carregandoAnteriores={carregandoAnteriores}
                carregandoPosteriores={carregandoPosteriores}
                aoCarregarAnteriores={carregarAnteriores}
                aoCarregarPosteriores={carregarPosteriores}
            />
        </MainLayout>
    )
}

export {CycleCalendarTestScreen}