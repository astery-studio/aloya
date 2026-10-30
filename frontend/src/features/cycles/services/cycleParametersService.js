import { endpoints } from '../../../shared/services/api/endpoints';
import { filtrarParametros, normalizarParametros } from './cycleParametersService.utils';

function criarCycleParametersService({ requisicaoAutenticada } = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar os parâmetros do ciclo.');
    }

    let atualizacaoEmAndamento = null;

    async function buscar({ signal } = {}) {
        const resposta = await requisicaoAutenticada({
            caminho: endpoints.parametrosCiclo,
            ...(signal ? { signal } : {})
        });
        return normalizarParametros(resposta);
    }

    function atualizar(dados) {
        if (atualizacaoEmAndamento) return atualizacaoEmAndamento;

        atualizacaoEmAndamento = requisicaoAutenticada({
            metodo: 'PATCH',
            caminho: endpoints.parametrosCiclo,
            corpo: filtrarParametros(dados)
        })
            .then(normalizarParametros)
            .finally(() => {
                atualizacaoEmAndamento = null;
            });

        return atualizacaoEmAndamento;
    }

    return { buscar, atualizar };
}

export { criarCycleParametersService };
