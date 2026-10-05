import { adicionarDias, diferencaDias, formatarData } from './utils/calendar.js';
import { classificarConfiabilidade } from './prediction.confidence.js';
import { CONFIG_PREVISAO } from './prediction.config.js';
import { construirIntervalos, identificarAmbiguidades } from './prediction.history.js';
import { AVISO_ANTICONCEPCIONAIS, AVISO_ESTIMATIVA } from './prediction.messages.js';
import { preverMenstruacao, preverSangramento } from './prediction.menstrual.js';
import { estimarFases, identificarFaseAtual } from './prediction.phases.js';
import { ORIGENS, selecionarDuracao } from './utils/statistics.js';

const LIMITACAO_ANTICONCEPCIONAIS = 'EFEITOS_DE_ANTICONCEPCIONAIS_NAO_CONSIDERADOS';

function ordenarRegistros(registros) {
    return [...registros].sort((a, b) => a.dataInicio - b.dataInicio);
}

function obterDuracoesSangramento(registrosOrdenados) {
    return registrosOrdenados
        .filter(({ dataInicio, dataFim }) => dataFim && dataFim >= dataInicio)
        .map(({ dataInicio, dataFim }) => (
            diferencaDias(dataInicio, dataFim) + 1
        ));
}

function obterFimMenstrual({ ultimoRegistro, inicioCiclo, duracaoEstimada }) {
    if (ultimoRegistro.dataFim) {
        return formatarData(ultimoRegistro.dataFim);
    }

    return adicionarDias(inicioCiclo, duracaoEstimada - 1);
}

function obterStatusPrevisao(menstrual, fases) {
    const fasesIndisponiveis = Boolean(fases.motivo);
    const previsaoMenstrualDisponivel = menstrual.status === 'DISPONIVEL';

    if (fasesIndisponiveis && previsaoMenstrualDisponivel) {
        return 'PARCIALMENTE_DISPONIVEL';
    }

    return menstrual.status;
}

function obterFaseAtual(menstrual, fases, dataReferencia) {
    if (menstrual.status === 'PREVISAO_ULTRAPASSADA') {
        return null;
    }

    return identificarFaseAtual(fases.fases, dataReferencia);
}

function obterLimitacoes(fases, ambiguidades) {
    const limitacoes = [
        LIMITACAO_ANTICONCEPCIONAIS,
        'FAIXA_ESTIMADA_NAO_VALIDADA'
    ];

    if (fases.motivo) {
        limitacoes.push(fases.motivo);
    }

    return [...limitacoes, ...ambiguidades];
}

function calcularPrevisao({ registros, parametros, dataReferencia, ambiguidades = [] }) {
    if (!registros.length) {
        return {
            status: 'DADOS_INSUFICIENTES',
            motivos: ['INICIO_ELEGIVEL_AUSENTE']
        };
    }

    const ambiguidadesEfetivas = [...new Set([
        ...ambiguidades,
        ...identificarAmbiguidades(registros)
    ])];
    const intervalos = construirIntervalos(registros);
    const ciclo = selecionarDuracao(
        intervalos,
        parametros.duracaoCicloInformada,
        CONFIG_PREVISAO.cicloPadrao
    );
    const registrosOrdenados = ordenarRegistros(registros);
    const ultimoRegistro = registrosOrdenados.at(-1);
    const inicioCiclo = formatarData(ultimoRegistro.dataInicio);

    const menstrual = preverMenstruacao({
        ultimoInicio: inicioCiclo,
        duracaoCiclo: ciclo.valor,
        dataReferencia
    });

    const duracoesSangramento = obterDuracoesSangramento(registrosOrdenados);
    const futuro = preverSangramento(
        menstrual.proximoInicioEstimado,
        duracoesSangramento,
        parametros.duracaoMenstruacaoInformada
    );

    const duracoesRecentes = duracoesSangramento
        .slice(-CONFIG_PREVISAO.maximoIntervalos)
        .map((duracao) => ({ duracao }));
    const duracaoAtual = selecionarDuracao(
        duracoesRecentes,
        parametros.duracaoMenstruacaoInformada,
        CONFIG_PREVISAO.sangramentoPadrao
    );
    const fimMenstrual = obterFimMenstrual({
        ultimoRegistro,
        inicioCiclo,
        duracaoEstimada: duracaoAtual.valor
    });
    const fases = estimarFases({
        inicioCiclo,
        fimMenstrual,
        proximoInicio: menstrual.proximoInicioEstimado,
        duracaoLutea: parametros.duracaoLuteaInformada
            ?? CONFIG_PREVISAO.luteaPadrao
    });
    const confiabilidade = classificarConfiabilidade({
        intervalos,
        origem: ciclo.origem,
        ambiguidades: ambiguidadesEfetivas
    });
    const limitacoes = obterLimitacoes(fases, ambiguidadesEfetivas);

    return {
        status: obterStatusPrevisao(menstrual, fases),
        dataReferencia,
        proximoInicioEstimado: menstrual.proximoInicioEstimado,
        faixaEstimada: null,
        periodoSangramentoEstimado: futuro,
        fasesEstimadas: fases.fases,
        janelaFertilEstimada: fases.janelaFertil,
        faseAtualEstimada: obterFaseAtual(menstrual, fases, dataReferencia),
        confiabilidadeMenstrual: confiabilidade,
        baseEstimativaOvulacao: {
            status: fases.motivo ? 'INDISPONIVEL' : 'ESTIMATIVA_POR_CALENDARIO',
            origemDuracaoLutea: parametros.duracaoLuteaInformada
                ? ORIGENS.DECLARADA : ORIGENS.PADRAO,
            limitacoes: ['OVULACAO_NAO_OBSERVADA', 'DURACAO_LUTEA_NAO_COMPROVADA']
        },
        quantidadeIntervalosUtilizados: Math.min(
            intervalos.length,
            CONFIG_PREVISAO.maximoIntervalos
        ),
        origemDuracaoCiclo: ciclo.origem,
        duracaoCicloEstimada: ciclo.valor,
        limitacoes,
        avisos: [AVISO_ESTIMATIVA, AVISO_ANTICONCEPCIONAIS],
        versaoAlgoritmo: CONFIG_PREVISAO.versao
    };
}

export { calcularPrevisao, LIMITACAO_ANTICONCEPCIONAIS };
