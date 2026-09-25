//Monta os serviços da aplicação usando uma URL HTTPS configurada pelo ambiente.
import { criarAuthService } from '../features/auth/services/authService'
import { criarAccountService } from '../features/settings/services/accountService'
import { criarApiClient } from './api/apiClient'
import { criarRequisicaoAutenticada } from './api/authenticatedRequest'
import { obterToken, removerToken } from './auth/tokenStorage'

const tempoLimiteDaRequisicao = 15000

function validarApiUrl(apiUrl) {
    if (typeof apiUrl !== 'string' || !apiUrl.trim()) {
        throw new Error('A URL da API não foi configurada.')
    }

    const url = new URL(apiUrl.trim())

    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
        throw new Error('A URL da API precisa utilizar HTTPS.')
    }

    return url.toString().replace(/\/$/, '')
}

function criarFetchComTempoLimite(fetchImpl) {
    return async function fetchComTempoLimite(url, opcoes = {}) {
        const controlador = new AbortController()
        const sinalExterno = opcoes.signal
        let tempoEsgotado = false

        function cancelarPeloChamador() {
            controlador.abort()
        }

        if (sinalExterno?.aborted) {
            controlador.abort()
        } else {
            sinalExterno?.addEventListener?.('abort', cancelarPeloChamador, {
                once: true
            })
        }

        const temporizador = setTimeout(() => {
            tempoEsgotado = true
            controlador.abort()
        }, tempoLimiteDaRequisicao)

        try {
            return await fetchImpl(url, {
                ...opcoes,
                signal: controlador.signal
            })
        } catch (erro) {
            if (erro?.name === 'AbortError' && sinalExterno?.aborted && !tempoEsgotado) {
                throw erro
            }

            if (erro?.name === 'AbortError') {
                const erroDeTempo = new Error('A conexão demorou demais. Tente novamente.')
                erroDeTempo.mensagemUsuario = erroDeTempo.message
                throw erroDeTempo
            }

            const erroDeRede = new Error('Não foi possível conectar ao servidor. Verifique sua conexão.')
            erroDeRede.mensagemUsuario = erroDeRede.message
            throw erroDeRede
        } finally {
            clearTimeout(temporizador)
            sinalExterno?.removeEventListener?.('abort', cancelarPeloChamador)
        }
    }
}

function criarServicosApp({apiUrl = process.env.EXPO_PUBLIC_API_URL, fetchImpl = fetch} = {}) {
    const baseUrl = validarApiUrl(apiUrl)
    const fetchSeguro = criarFetchComTempoLimite(fetchImpl)
    const {requisicao} = criarApiClient({baseUrl, fetchImpl: fetchSeguro})

    const requisicaoAutenticada = criarRequisicaoAutenticada({
        requisicao,
        obterCredencial: obterToken,
        removerCredencial: removerToken
    })

    const authService = criarAuthService({
        requisicao,
        requisicaoAutenticada,
        removerCredencialLocal: removerToken
    })

    const accountService = criarAccountService({
        requisicaoAutenticada,
        removerCredencialLocal: removerToken
    })

    return Object.freeze({
        authService,
        accountService
    })
}

export { criarServicosApp }