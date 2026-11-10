function diasDoRegistro(ciclo) {
    if (Array.isArray(ciclo.dias)) return [...new Set(ciclo.dias)].sort();
    const inicio = Date.parse(`${ciclo.dataInicio}T00:00:00Z`);
    const fim = Date.parse(`${ciclo.dataFim || ciclo.dataInicio}T00:00:00Z`);
    if (!Number.isFinite(inicio) || !Number.isFinite(fim)) return [];
    return Array.from(
        { length: Math.max(0, Math.min(366, (fim - inicio) / 86400000 + 1)) },
        (_, i) => new Date(inicio + i * 86400000).toISOString().slice(0, 10)
    );
}

function mesesParaEdicao(ciclo, dias) {
    const inicio = new Date(`${ciclo.dataInicio.slice(0, 7)}-01T00:00:00Z`);
    inicio.setUTCMonth(inicio.getUTCMonth() - 1);
    const fim = new Date(`${(ciclo.dataFim || ciclo.dataInicio).slice(0, 7)}-01T00:00:00Z`);
    fim.setUTCMonth(fim.getUTCMonth() + 1);
    const meses = [];
    while (inicio <= fim) {
        const mes = inicio.toISOString().slice(0, 7);
        meses.push({
            mes,
            diasMenstruacao: dias
                .filter((data) => data.startsWith(mes))
                .map((data) => ({ data, registroCicloId: ciclo.id }))
        });
        inicio.setUTCMonth(inicio.getUTCMonth() + 1);
    }
    return meses;
}
export { diasDoRegistro, mesesParaEdicao };

function contarEpisodios(dias) {
    const ordenados = [...dias].sort();
    return ordenados.reduce(
        (total, dia, indice) =>
            total +
            (indice === 0 ||
            Date.parse(`${dia}T00:00:00Z`) - Date.parse(`${ordenados[indice - 1]}T00:00:00Z`) >
                3 * 86400000
                ? 1
                : 0),
        0
    );
}
export { contarEpisodios };
