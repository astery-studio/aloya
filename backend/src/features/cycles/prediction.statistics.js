const ORIGENS = Object.freeze({
    HISTORICO: 'HISTORICO_INDIVIDUAL',
    DECLARADA: 'DURACAO_DECLARADA',
    PADRAO: 'PADRAO_PROVISORIO'
});

function mediana(valores) {
    const ordenados = [...valores].sort((a, b) => a - b);
    const meio = Math.floor(ordenados.length / 2);
    return ordenados.length % 2
        ? ordenados[meio]
        : Math.round((ordenados[meio - 1] + ordenados[meio]) / 2);
}

function selecionarDuracao(intervalos, duracaoDeclarada, padrao) {
    const recentes = intervalos.slice(-6).map(({ duracao }) => duracao);
    if (recentes.length) return {
        valor: mediana(recentes), origem: ORIGENS.HISTORICO,
        quantidade: recentes.length
    };
    return {
        valor: duracaoDeclarada ?? padrao,
        origem: duracaoDeclarada ? ORIGENS.DECLARADA : ORIGENS.PADRAO,
        quantidade: 0
    };
}

export { ORIGENS, mediana, selecionarDuracao };
