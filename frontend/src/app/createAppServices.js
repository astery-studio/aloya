//Monta os serviços da aplicação usando uma URL HTTPS configurada pelo ambiente.
import {criarAuthService} from '../features/auth/services/authService'
import {criarContraceptiveService} from '../features/contraceptives/services/contraceptiveService'
import {criarCycleHistoryService} from '../features/cycles/services/cycleHistoryService'
import {criarAccountService} from '../features/settings/services/accountService'
import {criarSupportCategoryService} from '../features/support-network/services/supportCategoryService'
import {criarApiClient} from '../shared/services/api/apiClient'
import {criarRequisicaoAutenticada} from '../shared/services/api/authenticatedRequest'
import {obterToken, removerToken} from '../shared/storage/tokenStorage'

const tempoLimiteDaRequisicao = 15000

//Valida a URL usada para impedir conexões inseguras fora do desenvolvimento.
function validarApiUrl(apiUrl, permitirHttpDesenvolvimento = false) {
    if (typeof apiUrl !== 'string' || !apiUrl.trim()) {
        throw new Error('A URL da API não foi configurada.')
    }

    const url = new URL(apiUrl.trim())

    const protocoloPermitido = url.protocol === 'https:'
        || (permitirHttpDesenvolvimento && url.protocol === 'http:')

    if (!protocoloPermitido || url.username || url.password || url.search || url.hash) {
        throw new Error('A URL da API precisa utilizar HTTPS.')
    }

    return url.toString().replace(/\/$/, '')
}

//Adiciona cancelamento e limite de tempo às chamadas feitas pelo cliente HTTP.
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

//Cria e congela todos os serviços compartilhados pela aplicação.
function criarServicosApp({apiUrl = process.env.EXPO_PUBLIC_API_URL, fetchImpl = fetch, permitirHttpDesenvolvimento = false} = {}) {
    const baseUrl = validarApiUrl(apiUrl, permitirHttpDesenvolvimento)
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

    const contraceptiveService = criarContraceptiveService({
        requisicaoAutenticada
    })

    const cycleHistoryService = criarCycleHistoryService({
        requisicaoAutenticada
    })

    const supportCategoryService = criarSupportCategoryService({
        requisicaoAutenticada
    })

    return Object.freeze({
        authService,
        accountService,
        contraceptiveService,
        cycleHistoryService,
        supportCategoryService
    })
}

export {criarServicosApp}