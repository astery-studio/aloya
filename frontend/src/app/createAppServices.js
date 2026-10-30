//Monta os serviços da aplicação usando uma URL HTTPS configurada pelo ambiente.
import { criarAuthService } from '../features/auth/services/authService';
import { criarCalendarService } from '../features/calendar/services/calendarService';
import { criarContraceptiveService } from '../features/contraceptives/services/contraceptiveService';
import { criarCycleHistoryService } from '../features/cycles/services/cycleHistoryService';
import { obterIdentidadeMenstrual } from '../features/cycles/services/menstruationIdentity';
import { criarMenstruationSyncQueue } from '../features/cycles/services/menstruationSyncQueue';
import { comRegistrosPendentes } from '../features/cycles/services/pendingCalendarService';
import { criarCycleParametersService } from '../features/cycles/services/cycleParametersService';
import { criarCyclePredictionService } from '../features/cycles/services/cyclePredictionService';
import { criarCycleRegistrationService } from '../features/cycles/services/cycleRegistrationService';
import { criarCycleRemovalService } from '../features/cycles/services/cycleRemovalService';
import { criarAccountService } from '../features/settings/services/accountService';
import { criarThemePreferenceService } from '../features/settings/services/themePreferenceService';
import { criarSupportCategoryService } from '../features/support-network/services/supportCategoryService';
import { criarApiClient } from '../shared/services/api/apiClient';
import { criarRequisicaoAutenticada } from '../shared/services/api/authenticatedRequest';
import { lerSeguro, salvarSeguro } from '../shared/storage/secureStorage';
import { obterToken, removerToken } from '../shared/storage/tokenStorage';

const tempoLimiteDaRequisicao = 15000;

//Recebe a URL configurada e garante que produção utilize somente HTTPS.
function validarApiUrl(apiUrl, permitirHttpDesenvolvimento = false) {
    if (typeof apiUrl !== 'string' || !apiUrl.trim()) {
        throw new Error('A URL da API não foi configurada.');
    }

    const url = new URL(apiUrl.trim());
    const protocoloPermitido =
        url.protocol === 'https:' || (permitirHttpDesenvolvimento && url.protocol === 'http:');

    if (!protocoloPermitido || url.username || url.password || url.search || url.hash) {
        throw new Error('A URL da API precisa utilizar HTTPS.');
    }

    return url.toString().replace(/\/$/, '');
}

//Recebe a configuração da API e devolve os serviços compartilhados pela aplicação.
function criarServicosApp({
    apiUrl = process.env.EXPO_PUBLIC_API_URL,
    fetchImpl = fetch,
    permitirHttpDesenvolvimento = false
} = {}) {
    const baseUrl = validarApiUrl(apiUrl, permitirHttpDesenvolvimento);
    const { requisicao } = criarApiClient({
        baseUrl,
        fetchImpl,
        timeoutMs: tempoLimiteDaRequisicao
    });

    const requisicaoAutenticada = criarRequisicaoAutenticada({
        requisicao,
        obterCredencial: obterToken,
        removerCredencial: removerToken
    });

    const authService = criarAuthService({
        requisicao,
        requisicaoAutenticada,
        removerCredencialLocal: removerToken
    });
    const accountService = criarAccountService({
        requisicaoAutenticada,
        removerCredencialLocal: removerToken
    });
    const themePreferenceService = criarThemePreferenceService({ requisicaoAutenticada });
    const calendarServiceBase = criarCalendarService({ requisicaoAutenticada });
    const contraceptiveService = criarContraceptiveService({ requisicaoAutenticada });
    const cycleHistoryServiceBase = criarCycleHistoryService({ requisicaoAutenticada });
    const cycleRemovalService = criarCycleRemovalService({ requisicaoAutenticada });

    const calendarServiceComRemocao = Object.freeze({
        ...calendarServiceBase,
        removerDia: cycleRemovalService.removerDia,
        excluirCiclo: cycleRemovalService.excluirCiclo
    });
    const cycleHistoryService = Object.freeze({
        ...cycleHistoryServiceBase,
        removerDia: cycleRemovalService.removerDia,
        excluirCiclo: cycleRemovalService.excluirCiclo
    });

    const supportCategoryService = criarSupportCategoryService({ requisicaoAutenticada });
    const cyclePredictionService = criarCyclePredictionService({ requisicaoAutenticada });
    const cycleParametersService = criarCycleParametersService({ requisicaoAutenticada });
    const cycleRegistrationService = criarCycleRegistrationService({ requisicaoAutenticada });
    const menstruationSyncQueue = criarMenstruationSyncQueue({
        ler: lerSeguro,
        salvar: salvarSeguro,
        registrar: cycleRegistrationService.registrar,
        identificar: async () => obterIdentidadeMenstrual(await obterToken()),
        criarChave: () => `menstrual-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`
    });
    const calendarService = comRegistrosPendentes({
        service: calendarServiceComRemocao,
        fila: menstruationSyncQueue
    });

    return Object.freeze({
        authService,
        accountService,
        themePreferenceService,
        calendarService,
        contraceptiveService,
        cycleHistoryService,
        supportCategoryService,
        cyclePredictionService,
        cycleParametersService,
        cycleRegistrationService,
        menstruationSyncQueue
    });
}

export { criarServicosApp };
