import { diferencaDias, paraDataCalendario } from './utils/calendar.js';

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

function identificarAmbiguidades(registros) {
    const inicios = registros.map(({ dataInicio }) => (
        dataInicio.toISOString().slice(0, 10)
    ));
    const motivos = [];

    if (new Set(inicios).size !== inicios.length) {
        motivos.push('INICIOS_DUPLICADOS');
    }

    if (registros.some(({ dataInicio, dataFim }) => dataFim && dataFim < dataInicio)) {
        motivos.push('FIM_ANTERIOR_AO_INICIO');
    }

    return motivos;
}

export { construirIntervalos, identificarAmbiguidades };
