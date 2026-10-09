//Monta os serviços da aplicação usando uma URL HTTPS configurada pelo ambiente.
import {criarAuthService} from '../features/auth/services/authService'
import {criarAccountService} from '../features/settings/services/accountService'
import {criarCalendarService} from '../features/calendar/services/calendarService'
import {criarContraceptiveService} from '../features/contraceptives/services/contraceptiveService'
import {criarSupportCategoryService} from '../features/support-network/services/supportCategoryService'
import {criarApiClient} from '../shared/services/api/apiClient'
import {criarRequisicaoAutenticada} from '../shared/services/api/authenticatedRequest'
import {obterToken, removerToken} from '../shared/storage/tokenStorage'

const tempoLimiteDaRequisicao = 15000

//Recebe a URL configurada e garante que produção utilize somente HTTPS.
function validarApiUrl(apiUrl, permitirHttpDesenvolvimento = false) {
    if (typeof apiUrl !== 'string' || !apiUrl.trim()) {
        throw new Error('A URL da API não foi configurada.')
    }

    const url = new URL(apiUrl.trim())
    const protocoloPermitido = url.protocol === 'https:' || (permitirHttpDesenvolvimento && url.protocol === 'http:')

    if (!protocoloPermitido || url.username || url.password || url.search || url.hash) {
        throw new Error('A URL da API precisa utilizar HTTPS.')
    }

    return url.toString().replace(/\/$/, '')
}

//Recebe a configuração da API e devolve os serviços compartilhados pela aplicação.
function criarServicosApp({apiUrl = process.env.EXPO_PUBLIC_API_URL, fetchImpl = fetch, permitirHttpDesenvolvimento = false} = {}) {
    const baseUrl = validarApiUrl(apiUrl, permitirHttpDesenvolvimento)
    const {requisicao} = criarApiClient({
        baseUrl,
        fetchImpl,
        timeoutMs: tempoLimiteDaRequisicao
    })

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

    const calendarService = criarCalendarService({
        requisicaoAutenticada
    })

    const contraceptiveService = criarContraceptiveService({
        requisicaoAutenticada
    })

    const supportCategoryService = criarSupportCategoryService({
        requisicaoAutenticada
    })

    return Object.freeze({
        authService,
        accountService,
        calendarService,
        contraceptiveService,
        supportCategoryService
    })
}

export {criarServicosApp}