const DIA_EM_MS = 86_400_000;

function dataCalendario(data) {
    return new Date(`${data.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

function construirIntervalos(registros) {
    const ordenados = registros
        .map(({ dataInicio }) => dataCalendario(dataInicio))
        .sort((a, b) => a - b);

    return ordenados.slice(1).map((inicioSeguinte, indice) => ({
        inicioAnterior: ordenados[indice],
        inicioSeguinte,
        duracao: Math.round((inicioSeguinte - ordenados[indice]) / DIA_EM_MS)
    }));
}

export { construirIntervalos };
