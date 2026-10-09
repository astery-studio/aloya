import { mediana } from './statistics.js';

const ORIGENS = Object.freeze({
    HISTORICO: 'HISTORICO_INDIVIDUAL',
    DECLARADA: 'DURACAO_DECLARADA',
    PADRAO: 'PADRAO_PROVISORIO'
});

function ehDuracaoValida(valor) {
    return Number.isSafeInteger(valor) && valor > 0;
}

function selecionarDuracao(duracoesHistoricas, duracaoDeclarada, padrao) {
    const historicoValido = Array.isArray(duracoesHistoricas)
        && duracoesHistoricas.every(ehDuracaoValida);
    const declaradaValida = duracaoDeclarada === null
        || duracaoDeclarada === undefined
        || ehDuracaoValida(duracaoDeclarada);

    if (!historicoValido || !declaradaValida || !ehDuracaoValida(padrao)) {
        throw new TypeError('Duração deve ser um inteiro positivo seguro.');
    }

    if (duracoesHistoricas.length) {
        return {
            valor: mediana(duracoesHistoricas),
            origem: ORIGENS.HISTORICO,
            quantidade: duracoesHistoricas.length
        };
    }

    return {
        valor: duracaoDeclarada ?? padrao,
        origem: duracaoDeclarada ? ORIGENS.DECLARADA : ORIGENS.PADRAO,
        quantidade: 0
    };
}

export { ORIGENS, selecionarDuracao };
