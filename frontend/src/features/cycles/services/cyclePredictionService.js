import { endpoints } from '../../../shared/services/api/endpoints';

function validarPrevisao(previsao) {
    if (!previsao || typeof previsao !== 'object' || typeof previsao.status !== 'string') {
        throw new Error('A API retornou uma previsão inválida.');
    }

    return previsao;
}

function criarCyclePredictionService({ requisicaoAutenticada }) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço de previsão.');
    }

    async function buscar({ signal } = {}) {
        const resposta = await requisicaoAutenticada({
            caminho: endpoints.previsaoCiclo,
            signal
        });

        return validarPrevisao(resposta?.previsao);
    }

    return Object.freeze({ buscar });
}

export { criarCyclePredictionService, validarPrevisao };
