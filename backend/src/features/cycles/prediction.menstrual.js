import { adicionarDias } from './utils/calendar.js';
import { CONFIG_PREVISAO } from './prediction.config.js';
import { selecionarDuracao } from './utils/statistics.js';

function preverMenstruacao({ ultimoInicio, duracaoCiclo, dataReferencia }) {
    const proximoInicioEstimado = adicionarDias(ultimoInicio, duracaoCiclo);
    const previsaoUltrapassada = dataReferencia > proximoInicioEstimado;

    return {
        status: previsaoUltrapassada
            ? 'PREVISAO_ULTRAPASSADA'
            : 'DISPONIVEL',
        proximoInicioEstimado
    };
}

function preverSangramento(inicio, duracoesCompletas, duracaoDeclarada) {
    const selecao = selecionarDuracao(
        duracoesCompletas.slice(-6).map((duracao) => ({ duracao })),
        duracaoDeclarada,
        CONFIG_PREVISAO.sangramentoPadrao
    );
    return {
        inicio,
        fim: adicionarDias(inicio, selecao.valor - 1),
        tipo: 'FUTURO_PREVISTO',
        origemDuracao: selecao.origem
    };
}

export { preverMenstruacao, preverSangramento };
