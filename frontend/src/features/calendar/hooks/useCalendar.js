//Carrega meses do calendário pela API e controla paginação e falhas.
import {useCallback, useEffect, useRef, useState} from 'react'

const MENSAGEM_ERRO = 'Não foi possível carregar os dados do calendário. Tente novamente.'
const CODIGOS_SESSAO_INVALIDA = new Set([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA',
    'SESSAO_AUSENTE'
])

function obterChaveMes(data = new Date()) {
    const ano = String(data.getFullYear()).padStart(4, '0')
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    return `${ano}-${mes}`
}

function deslocarMes(chave, quantidade) {
    const [anoRecebido, mesRecebido] = chave.split('-').map(Number)
    const data = new Date(0)
    data.setHours(0, 0, 0, 0)
    data.setFullYear(anoRecebido, mesRecebido - 1 + quantidade, 1)

    const ano = String(data.getFullYear()).padStart(4, '0')
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    return `${ano}-${mes}`
}

function ordenarMeses(meses) {
    return [...meses].sort((primeiro, segundo) => primeiro.mes.localeCompare(segundo.mes))
}

function useCalendar({service, onSessaoExpirada} = {}) {
    const mesAtual = useRef(obterChaveMes()).current
    const [meses, setMeses] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [carregandoAnteriores, setCarregandoAnteriores] = useState(false)
    const [carregandoPosteriores, setCarregandoPosteriores] = useState(false)
    const [erro, setErro] = useState(null)
    const mesesRef = useRef([])
    const requisicoes = useRef(new Map())
    const montado = useRef(false)
    const ultimaFalha = useRef(null)

    useEffect(() => {
        mesesRef.current = meses
    }, [meses])

    const carregarMes = useCallback(async (mes, tipo = 'inicial') => {
        if (requisicoes.current.has(mes)) return

        if (mesesRef.current.some(item => item.mes === mes)) return

        ultimaFalha.current = {mes, tipo}
        setErro(null)

        if (typeof service?.buscarMes !== 'function') {
            setErro(MENSAGEM_ERRO)
            if (tipo === 'inicial') setCarregando(false)
            return
        }

        const controlador = new AbortController()
        requisicoes.current.set(mes, controlador)

        if (tipo === 'inicial') setCarregando(true)
        if (tipo === 'anterior') setCarregandoAnteriores(true)
        if (tipo === 'posterior') setCarregandoPosteriores(true)

        try {
            const calendario = await service.buscarMes({
                mes,
                signal: controlador.signal
            })

            if (!montado.current || controlador.signal.aborted) return

            setMeses(mesesAtuais => {
                const semDuplicatas = mesesAtuais.filter(item => item.mes !== calendario.mes)
                const atualizados = ordenarMeses([...semDuplicatas, calendario])
                mesesRef.current = atualizados
                return atualizados
            })
            ultimaFalha.current = null
        } catch (falha) {
            if (falha?.name === 'AbortError' || controlador.signal.aborted || !montado.current) {
                return
            }

            if (
                falha?.status === 401
                || CODIGOS_SESSAO_INVALIDA.has(falha?.codigo)
            ) {
                onSessaoExpirada?.()
                return
            }

            setErro(falha?.mensagemUsuario || MENSAGEM_ERRO)
        } finally {
            requisicoes.current.delete(mes)

            if (montado.current) {
                if (tipo === 'inicial') setCarregando(false)
                if (tipo === 'anterior') setCarregandoAnteriores(false)
                if (tipo === 'posterior') setCarregandoPosteriores(false)
            }
        }
    }, [onSessaoExpirada, service])

    useEffect(() => {
        montado.current = true
        carregarMes(mesAtual, 'inicial')

        return () => {
            montado.current = false

            for (const controlador of requisicoes.current.values()) {
                controlador.abort()
            }

            requisicoes.current.clear()
        }
    }, [carregarMes, mesAtual])

    const carregarAnteriores = useCallback(() => {
        const primeiroMes = mesesRef.current[0]?.mes || mesAtual
        return carregarMes(deslocarMes(primeiroMes, -1), 'anterior')
    }, [carregarMes, mesAtual])

    const carregarPosteriores = useCallback(() => {
        const ultimoMes = mesesRef.current[mesesRef.current.length - 1]?.mes || mesAtual
        return carregarMes(deslocarMes(ultimoMes, 1), 'posterior')
    }, [carregarMes, mesAtual])

    const tentarNovamente = useCallback(() => {
        const falha = ultimaFalha.current

        if (falha) return carregarMes(falha.mes, falha.tipo)
        return carregarMes(mesAtual, 'inicial')
    }, [carregarMes, mesAtual])

    return {
        meses,
        carregando,
        carregandoAnteriores,
        carregandoPosteriores,
        erro,
        carregarAnteriores,
        carregarPosteriores,
        tentarNovamente
    }
}

export {deslocarMes, obterChaveMes, useCalendar}