const DIA_EM_MS = 86_400_000;

function dataCalendario(data) {
    return new Date(`${data.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

function construirIntervalos(registros) {
    const ordenados = registros
        .map(({ dataInicio }) => dataCalendario(dataInicio))
        .sort((a, b) => a - b);

    return ordenados
        .slice(1)
        .map((inicioSeguinte, indice) => ({
            inicioAnterior: ordenados[indice],
            inicioSeguinte,
            duracao: Math.round(
                (inicioSeguinte - ordenados[indice]) / DIA_EM_MS
            )
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
