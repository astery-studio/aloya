function estaNoIntervalo(data, intervalo) {
    return Boolean(
        intervalo
        && data >= intervalo.inicio
        && data <= intervalo.fim
    );
}

function obterFaseNaData(previsao, dataReferencia) {
    const fases = previsao.fasesEstimadas;

    if (!fases) return null;
    if (estaNoIntervalo(dataReferencia, fases.menstrual)) return 'MENSTRUAL';
    if (estaNoIntervalo(dataReferencia, fases.folicularPosMenstrual)) return 'FOLICULAR';
    if (fases.ovulatoria?.data === dataReferencia) return 'OVULATORIA';
    if (estaNoIntervalo(dataReferencia, fases.lutea)) return 'LUTEA';

    return null;
}

export { estaNoIntervalo, obterFaseNaData };
