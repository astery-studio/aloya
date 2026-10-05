import {
    diferencaDias,
    formatarData,
    paraDataCalendario
} from './utils/calendar.js';
import { CONFIG_PREVISAO } from './prediction.config.js';

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
        dataInicio.toISOString().slice(0, 10)
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
    selecionarIntervalosRecentes
};
