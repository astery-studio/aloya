import {
    diferencaDias,
    ehDataCalendarioValida,
    formatarData,
    paraDataCalendario
} from './calendar.js';
import { CONFIG_PREVISAO } from '../constants/prediction.config.js';

function selecionarRegistrosElegiveis(registros, dataReferencia) {
    const referencia = formatarData(dataReferencia);
    const elegiveis = [];
    const ambiguidades = [];

    for (const registro of registros) {
        if (!registro || !ehDataCalendarioValida(registro.dataInicio)) {
            ambiguidades.push('INICIO_INVALIDO');
            continue;
        }

        if (formatarData(registro.dataInicio) > referencia) {
            ambiguidades.push('INICIO_FUTURO_IGNORADO');
            continue;
        }

        const possuiFim = registro.dataFim !== null
            && registro.dataFim !== undefined;
        const fimValido = !possuiFim
            || ehDataCalendarioValida(registro.dataFim);

        if (!fimValido) {
            ambiguidades.push('FIM_INVALIDO_IGNORADO');
        }

        const fimFuturo = fimValido
            && possuiFim
            && formatarData(registro.dataFim) > referencia;

        if (fimFuturo) {
            ambiguidades.push('FIM_FUTURO_IGNORADO');
        }

        elegiveis.push({
            ...registro,
            dataFim: fimValido && !fimFuturo
                ? registro.dataFim ?? null
                : null
        });
    }

    return {
        registros: elegiveis,
        ambiguidades: [...new Set(ambiguidades)]
    };
}

function construirIntervalos(registros) {
    const ordenados = registros
        .map(({ dataInicio }) => paraDataCalendario(dataInicio))
        .sort((a, b) => a - b);

    return ordenados
        .slice(1)
        .map((inicioSeguinte, indice) => ({
            inicioAnterior: ordenados[indice],
            inicioSeguinte,
            duracao: diferencaDias(ordenados[indice], inicioSeguinte)
        }))
        .filter(({ duracao }) => duracao > 0);
}

function selecionarIntervalosRecentes(intervalos) {
    return intervalos.slice(-CONFIG_PREVISAO.maximoIntervalos);
}

function identificarAmbiguidades(registros) {
    const inicios = registros.map(({ dataInicio }) => (
        formatarData(dataInicio)
    ));
    const motivos = [];

    if (new Set(inicios).size !== inicios.length) {
        motivos.push('INICIOS_DUPLICADOS');
    }

    const possuiFimAnteriorAoInicio = registros.some(({ dataInicio, dataFim }) => (
        dataFim && diferencaDias(dataInicio, dataFim) < 0
    ));

    if (possuiFimAnteriorAoInicio) {
        motivos.push('FIM_ANTERIOR_AO_INICIO');
    }

    return motivos;
}

export {
    construirIntervalos,
    identificarAmbiguidades,
    selecionarRegistrosElegiveis,
    selecionarIntervalosRecentes
};
