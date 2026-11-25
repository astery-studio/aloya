import { endpoints } from '../../shared/services/api/endpoints';

export function criarNotificationPreferencesService({ requisicaoAutenticada }) {
    async function buscar({ signal } = {}) {
        const resposta = await requisicaoAutenticada({
            caminho: endpoints.preferenciasNotificacao,
            signal
        });
        return resposta.preferencias;
    }

    async function atualizar(alteracao) {
        const resposta = await requisicaoAutenticada({
            metodo: 'PATCH',
            caminho: endpoints.preferenciasNotificacao,
            corpo: alteracao
        });
        return resposta.preferencias;
    }

    return { buscar, atualizar };
}
