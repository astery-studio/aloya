import { adicionarDias } from './prediction.calendar.js';
import { selecionarDuracao } from './prediction.statistics.js';

function preverMenstruacao({ ultimoInicio, duracaoCiclo, dataReferencia }) {
    const proximoInicioEstimado = adicionarDias(ultimoInicio, duracaoCiclo);
    return {
        status: dataReferencia > proximoInicioEstimado
            ? 'PREVISAO_ULTRAPASSADA'
            : 'DISPONIVEL',
        proximoInicioEstimado
    };
}

function preverSangramento(inicio, duracoesCompletas, duracaoDeclarada) {
    const selecao = selecionarDuracao(
        duracoesCompletas.slice(-6).map((duracao) => ({ duracao })),
        duracaoDeclarada,
        5
    );
    return {
        inicio,
        fim: adicionarDias(inicio, selecao.valor - 1),
        tipo: 'FUTURO_PREVISTO',
        origemDuracao: selecao.origem
    };
}

export { preverMenstruacao, preverSangramento };
