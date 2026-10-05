import { mediana } from './utils/statistics.js';

const ORIGENS = Object.freeze({
    HISTORICO: 'HISTORICO_INDIVIDUAL',
    DECLARADA: 'DURACAO_DECLARADA',
    PADRAO: 'PADRAO_PROVISORIO'
});

function selecionarDuracao(duracoesHistoricas, duracaoDeclarada, padrao) {
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
