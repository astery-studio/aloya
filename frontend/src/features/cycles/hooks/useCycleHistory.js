//Controla carregamento inicial, erros, cancelamento e paginação do histórico de ciclos.
import {useCallback, useEffect, useRef, useState} from 'react'

const LIMITE_DA_PAGINA = 20
const MENSAGEM_ERRO = 'Não foi possível carregar seu histórico de ciclos. Tente novamente.'

//Confere se o serviço necessário foi configurado corretamente.
function validarService(service) {
    if (!service || typeof service.listarPagina !== 'function') {
        throw new Error('Não foi possível configurar o histórico de ciclos.')
    }
}

//Une páginas sem repetir ciclos que já estejam visíveis.
function unirCiclos(ciclosAtuais, novosCiclos) {
    const idsAtuais = new Set(ciclosAtuais.map(ciclo => ciclo.id))
    return [...ciclosAtuais, ...novosCiclos.filter(ciclo => !idsAtuais.has(ciclo.id))]
}

//Controla o estado do histórico enquanto a tela estiver montada.
function useCycleHistory({service, onSessaoExpirada} = {}) {
    validarService(service)

    const [ciclos, setCiclos] = useState([])
    const [quantidadeCiclos, setQuantidadeCiclos] = useState(0)
    const [paginacao, setPaginacao] = useState({
        temMais: false,
        proximoCursor: null
    })
    const [carregando, setCarregando] = useState(true)
    const [carregandoMais, setCarregandoMais] = useState(false)
    const [erro, setErro] = useState(null)
    const [erroCarregarMais, setErroCarregarMais] = useState(null)

    const montado = useRef(false)
    const controladorAtual = useRef(null)
    const requisicaoAtual = useRef(0)
    const carregamentoMaisEmAndamento = useRef(false)
    const onSessaoExpiradaRef = useRef(onSessaoExpirada)

    useEffect(() => {
        onSessaoExpiradaRef.current = onSessaoExpirada
    }, [onSessaoExpirada])

    //Carrega novamente a primeira página e substitui os dados anteriores.
    const carregarInicial = useCallback(async () => {
        controladorAtual.current?.abort()

        const controlador = new AbortController()
        const identificador = requisicaoAtual.current + 1

        controladorAtual.current = controlador
        requisicaoAtual.current = identificador
        carregamentoMaisEmAndamento.current = false

        if (montado.current) {
            setCarregando(true)
            setCarregandoMais(false)
            setErro(null)
            setErroCarregarMais(null)
        }

        try {
            const pagina = await service.listarPagina({
                limite: LIMITE_DA_PAGINA,
                signal: controlador.signal
            })

            if (!montado.current || requisicaoAtual.current !== identificador) {
                return false
            }

            setCiclos(pagina.ciclos)
            setQuantidadeCiclos(pagina.quantidadeCiclos)
            setPaginacao({
                temMais: pagina.paginacao.temMais,
                proximoCursor: pagina.paginacao.proximoCursor
            })

            return true
        } catch (falha) {
            if (falha?.name === 'AbortError' || !montado.current || requisicaoAtual.current !== identificador) {
                return false
            }

            if (falha?.status === 401) {
                onSessaoExpiradaRef.current?.({
                    mensagem: 'Sua sessão expirou. Entre novamente.'
                })

                return false
            }

            setErro(MENSAGEM_ERRO)
            return false
        } finally {
            if (montado.current && requisicaoAtual.current === identificador) {
                controladorAtual.current = null
                setCarregando(false)
            }
        }
    }, [service])

    //Carrega a próxima página sem apagar os ciclos que já aparecem na tela.
    const carregarMais = useCallback(async () => {
        const cursor = paginacao.proximoCursor

        if (carregando || carregamentoMaisEmAndamento.current || !paginacao.temMais || !cursor) {
            return false
        }

        carregamentoMaisEmAndamento.current = true

        const controlador = new AbortController()
        const identificador = requisicaoAtual.current + 1

        controladorAtual.current = controlador
        requisicaoAtual.current = identificador

        if (montado.current) {
            setCarregandoMais(true)
            setErroCarregarMais(null)
        }

        try {
            const pagina = await service.listarPagina({
                limite: LIMITE_DA_PAGINA,
                cursor,
                signal: controlador.signal
            })

            if (!montado.current || requisicaoAtual.current !== identificador) {
                return false
            }

            setCiclos(atuais => unirCiclos(atuais, pagina.ciclos))
            setQuantidadeCiclos(pagina.quantidadeCiclos)
            setPaginacao({
                temMais: pagina.paginacao.temMais,
                proximoCursor: pagina.paginacao.proximoCursor
            })

            return true
        } catch (falha) {
            if (falha?.name === 'AbortError' || !montado.current || requisicaoAtual.current !== identificador) {
                return false
            }

            if (falha?.status === 401) {
                onSessaoExpiradaRef.current?.({
                    mensagem: 'Sua sessão expirou. Entre novamente.'
                })

                return false
            }

            setErroCarregarMais(MENSAGEM_ERRO)
            return false
        } finally {
            if (montado.current && requisicaoAtual.current === identificador) {
                controladorAtual.current = null
                carregamentoMaisEmAndamento.current = false
                setCarregandoMais(false)
            }
        }
    }, [carregando, paginacao, service])

    useEffect(() => {
        montado.current = true
        carregarInicial()

        return () => {
            montado.current = false
            requisicaoAtual.current += 1
            carregamentoMaisEmAndamento.current = false
            controladorAtual.current?.abort()
            controladorAtual.current = null
        }
    }, [carregarInicial])

    return {
        ciclos,
        quantidadeCiclos,
        carregando,
        carregandoMais,
        erro,
        erroCarregarMais,
        temMais: paginacao.temMais,
        carregarMais,
        tentarNovamente: carregarInicial,
        tentarCarregarMais: carregarMais
    }
}

export {useCycleHistory}