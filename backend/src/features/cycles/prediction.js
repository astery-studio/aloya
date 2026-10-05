import { adicionarDias, diferencaDias, formatarData } from './prediction.calendar.js';
import { classificarConfiabilidade } from './prediction.confidence.js';
import { construirIntervalos } from './prediction.history.js';
import { preverMenstruacao, preverSangramento } from './prediction.menstrual.js';
import { estimarFases, identificarFaseAtual } from './prediction.phases.js';
import { ORIGENS, selecionarDuracao } from './prediction.statistics.js';
const LIMITACAO_ANTICONCEPCIONAIS = 'EFEITOS_DE_ANTICONCEPCIONAIS_NAO_CONSIDERADOS';
function calcularPrevisao({ registros, parametros, dataReferencia, ambiguidades = [] }) {
    if (!registros.length) return {
        status: 'DADOS_INSUFICIENTES', motivos: ['INICIO_ELEGIVEL_AUSENTE']
    };
    const intervalos = construirIntervalos(registros);
    const ciclo = selecionarDuracao(intervalos, parametros.duracaoCicloInformada, 28);
    const ultimo = [...registros].sort((a, b) => b.dataInicio - a.dataInicio)[0];
    const inicioCiclo = formatarData(ultimo.dataInicio);
    const menstrual = preverMenstruacao({
        ultimoInicio: inicioCiclo, duracaoCiclo: ciclo.valor, dataReferencia
    });
    const duracoesSangramento = [...registros]
        .sort((a, b) => a.dataInicio - b.dataInicio)
        .filter(({ dataFim }) => dataFim)
        .map(({ dataInicio, dataFim }) => diferencaDias(dataInicio, dataFim) + 1);
    const futuro = preverSangramento(
        menstrual.proximoInicioEstimado, duracoesSangramento,
        parametros.duracaoMenstruacaoInformada
    );
    const duracaoAtual = selecionarDuracao(
        duracoesSangramento.slice(-6).map((duracao) => ({ duracao })),
        parametros.duracaoMenstruacaoInformada, 5
    );
    const fimMenstrual = ultimo.dataFim
        ? formatarData(ultimo.dataFim)
        : adicionarDias(inicioCiclo, duracaoAtual.valor - 1);
    const fases = estimarFases({
        inicioCiclo, fimMenstrual,
        proximoInicio: menstrual.proximoInicioEstimado, duracaoLutea: parametros.duracaoLuteaInformada ?? 14
    });
    const confiabilidade = classificarConfiabilidade({
        intervalos, origem: ciclo.origem, ambiguidades
    });
    const limitacoes = [LIMITACAO_ANTICONCEPCIONAIS, 'FAIXA_ESTIMADA_NAO_VALIDADA'];
    if (!ultimo.dataFim) limitacoes.push('FIM_SANGRAMENTO_ATUAL_NAO_REGISTRADO');
    if (fases.motivo) limitacoes.push(fases.motivo);
    return {
        status: fases.motivo && menstrual.status === 'DISPONIVEL'
            ? 'PARCIALMENTE_DISPONIVEL' : menstrual.status,
        dataReferencia, proximoInicioEstimado: menstrual.proximoInicioEstimado,
        faixaEstimada: null, periodoSangramentoEstimado: futuro,
        sangramentoAtual: {
            inicio: inicioCiclo, fim: ultimo.dataFim ? formatarData(ultimo.dataFim) : null,
            status: ultimo.dataFim ? 'REGISTRADO' : 'INICIO_REGISTRADO_FIM_DESCONHECIDO'
        },
        fasesEstimadas: fases.fases, janelaFertilEstimada: fases.janelaFertil,
        faseAtualEstimada: menstrual.status === 'PREVISAO_ULTRAPASSADA'
            ? null : identificarFaseAtual(fases.fases, dataReferencia),
        confiabilidadeMenstrual: confiabilidade,
        baseEstimativaOvulacao: {
            status: fases.motivo ? 'INDISPONIVEL' : 'ESTIMATIVA_POR_CALENDARIO',
            origemDuracaoLutea: parametros.duracaoLuteaInformada
                ? ORIGENS.DECLARADA : ORIGENS.PADRAO,
            limitacoes: ['OVULACAO_NAO_OBSERVADA', 'DURACAO_LUTEA_NAO_COMPROVADA']
        },
        quantidadeIntervalosUtilizados: Math.min(intervalos.length, 6),
        origemDuracaoCiclo: ciclo.origem, duracaoCicloEstimada: ciclo.valor,
        limitacoes, versaoAlgoritmo: '1.0.0'
    };
}
export { calcularPrevisao, LIMITACAO_ANTICONCEPCIONAIS };
