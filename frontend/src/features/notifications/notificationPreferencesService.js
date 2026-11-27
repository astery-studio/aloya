import { endpoints } from '../../shared/services/api/endpoints';

export function criarNotificationPreferencesService({ requisicaoAutenticada, contato = false }) {
    const caminho = contato
        ? `${endpoints.preferenciasNotificacao}/contato`
        : endpoints.preferenciasNotificacao;

    function apresentar({ preferencias, chavesDisponiveis, efetivas }) {
        return { ...preferencias, chavesDisponiveis, efetivas };
    }

    async function buscar({ signal } = {}) {
        const resposta = await requisicaoAutenticada({
            caminho,
            signal
        });
        return apresentar(resposta);
    }

    async function atualizar(alteracao) {
        const resposta = await requisicaoAutenticada({
            metodo: 'PATCH',
            caminho,
            corpo: alteracao
        });
        return apresentar(resposta);
    }

    return { buscar, atualizar };
}
