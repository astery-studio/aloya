//Calcula as métricas e a confiança exibidas no resumo do histórico.
import {
    classificarConfiabilidade
} from './prediction.confidence.js';

import {
    CONFIG_PREVISAO
} from '../constants/prediction.config.js';

import {
    ORIGENS
} from './prediction.duration.js';

import {
    construirIntervalos,
    identificarAmbiguidades,
    selecionarIntervalosRecentes
} from './prediction.history.js';

import {
    mediana
} from './statistics.js';

//Confere se a quantidade total recebida do banco pode aparecer no resumo.
function validarQuantidadeCiclos(quantidadeCiclos) {
    if (!Number.isSafeInteger(quantidadeCiclos) || quantidadeCiclos < 0) {
        throw new TypeError('A quantidade de ciclos do resumo é inválida.');
    }
}

//Confere se os registros possuem uma estrutura adequada para os cálculos.
function validarRegistros(registros) {
    if (!Array.isArray(registros)) {
        throw new TypeError('Os registros do resumo de ciclos são inválidos.');
    }

    for (const registro of registros) {
        if (!registro || typeof registro !== 'object' || Array.isArray(registro)) {
            throw new TypeError('Os registros do resumo de ciclos são inválidos.');
        }

        const duracao = registro.duracaoMenstruacao;

        if (duracao !== null && duracao !== undefined && (!Number.isSafeInteger(duracao) || duracao <= 0)) {
            throw new TypeError('A duração menstrual do resumo é inválida.');
        }
    }
}

//Seleciona no máximo as seis durações menstruais mais recentes.
function selecionarDuracoesMenstruais(registros) {
    return [...registros]
        .sort((a, b) => b.dataInicio - a.dataInicio)
        .slice(0, CONFIG_PREVISAO.maximoIntervalos)
        .map(registro => registro.duracaoMenstruacao)
        .filter(duracao => duracao !== null && duracao !== undefined);
}

//Converte o nível interno do cálculo para o contrato usado pelo frontend.
function apresentarConfianca(nivel) {
    const niveis = {
        BAIXA: 'baixa',
        MEDIA: 'media',
        ALTA: 'alta'
    };

    const confianca = niveis[nivel];

    if (!confianca) {
        throw new TypeError('O nível de confiança calculado é inválido.');
    }

    return confianca;
}

//Monta o resumo usando somente dados persistidos da pessoa autenticada.
function criarResumoHistorico({registros, quantidadeCiclos} = {}) {
    validarQuantidadeCiclos(quantidadeCiclos);
    validarRegistros(registros);

    const intervalos = selecionarIntervalosRecentes(
        construirIntervalos(registros)
    );

    const duracoesCiclo = intervalos.map(
        intervalo => intervalo.duracao
    );

    const duracoesMenstruais =
        selecionarDuracoesMenstruais(registros);

    const origem = intervalos.length
        ? ORIGENS.HISTORICO
        : ORIGENS.PADRAO;

    const confiabilidade =
        classificarConfiabilidade({
            intervalos,
            origem,
            ambiguidades:
                identificarAmbiguidades(registros)
        });

    return {
        cicloMedioDias: duracoesCiclo.length
            ? mediana(duracoesCiclo)
            : null,
        menstruacaoMediaDias:
            duracoesMenstruais.length
                ? mediana(duracoesMenstruais)
                : null,
        quantidadeCiclos,
        confianca:
            apresentarConfianca(
                confiabilidade.nivel
            )
    };
}

export {
    criarResumoHistorico
};