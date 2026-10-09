import { adicionarDias, diferencaDias, formatarData } from './calendar.js';
import { classificarConfiabilidade } from './prediction.confidence.js';
import { CONFIG_PREVISAO } from '../constants/prediction.config.js';
import { ORIGENS, selecionarDuracao } from './prediction.duration.js';
import {
    construirIntervalos,
    identificarAmbiguidades,
    selecionarIntervalosRecentes,
    selecionarRegistrosElegiveis
} from './prediction.history.js';
import {
    AVISO_ANTICONCEPCIONAIS,
    AVISO_ESTIMATIVA,
    INCENTIVO_CONFIANCA_BAIXA
} from '../constants/prediction.messages.js';
import { preverMenstruacao, preverSangramento } from './prediction.menstrual.js';
import { estimarFases } from './prediction.phases.js';

const LIMITACAO_ANTICONCEPCIONAIS = 'EFEITOS_DE_ANTICONCEPCIONAIS_NAO_CONSIDERADOS';

function ordenarRegistros(registros) {
    return [...registros].sort((a, b) => (
        formatarData(a.dataInicio).localeCompare(formatarData(b.dataInicio))
    ));
}

function obterDuracoesSangramento(registrosOrdenados) {
    return registrosOrdenados
        .filter(({ dataInicio, dataFim }) => (
            dataFim && diferencaDias(dataInicio, dataFim) >= 0
        ))
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
    const historico = selecionarRegistrosElegiveis(registros, dataReferencia);
    const registrosElegiveis = historico.registros;

    if (!registrosElegiveis.length) {
        return {
            status: 'DADOS_INSUFICIENTES',
            motivos: [
                'INICIO_ELEGIVEL_AUSENTE',
                ...historico.ambiguidades
            ]
        };
    }

    const ambiguidadesEfetivas = [...new Set([
        ...ambiguidades,
        ...historico.ambiguidades,
        ...identificarAmbiguidades(registrosElegiveis)
    ])];
    const intervalos = construirIntervalos(registrosElegiveis);
    const intervalosRecentes = selecionarIntervalosRecentes(intervalos);
    const duracoesCiclo = intervalosRecentes.map(({ duracao }) => duracao);
    const ciclo = selecionarDuracao(
        duracoesCiclo,
        parametros.duracaoCicloInformada,
        CONFIG_PREVISAO.cicloPadrao
    );
    const registrosOrdenados = ordenarRegistros(registrosElegiveis);
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
        .slice(-CONFIG_PREVISAO.maximoIntervalos);
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
    const avisos = [AVISO_ESTIMATIVA, AVISO_ANTICONCEPCIONAIS];

    if (confiabilidade.nivel === 'BAIXA') {
        avisos.push(INCENTIVO_CONFIANCA_BAIXA);
    }

    return {
        status: obterStatusPrevisao(menstrual, fases),
        dataReferencia,
        proximoInicioEstimado: menstrual.proximoInicioEstimado,
        faixaEstimada: null,
        periodoSangramentoEstimado: futuro,
        fasesEstimadas: fases.fases,
        dataOvulacaoEstimada: fases.fases?.ovulatoria.data ?? null,
        janelaFertilEstimada: fases.janelaFertil,
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
        avisos,
        versaoAlgoritmo: CONFIG_PREVISAO.versao
    };
}

export { calcularPrevisao, LIMITACAO_ANTICONCEPCIONAIS };
