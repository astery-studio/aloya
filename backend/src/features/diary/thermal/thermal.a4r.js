import { adicionarDias } from './thermal.dates.js';
import { detectarPadraoTermico } from './thermal.engine.js';

function detectarA4R(medicoes, config, contexto = {}) {
    if (!contexto.cicloConcluido || !contexto.dataFimCiclo) {
        return {
            algoritmo: config.algoritmo,
            versao: config.versao,
            variante: config.variante,
            disponibilidade: config.disponibilidade,
            modo: 'retrospectivo',
            estado: 'INCONCLUSIVO',
            motivo: 'CICLO_NAO_CONCLUIDO',
            sequencias: [],
            janelasAvaliaveis: 0,
            aplicarEvidenciaNaConfianca: false
        };
    }
    const inicioFiltro = adicionarDias(contexto.dataFimCiclo, 1 - config.filtrarUltimosDiasCiclo);
    const inicioDados = adicionarDias(inicioFiltro, -config.janelaReferenciaDias);
    const elegiveis = medicoes.filter(
        ({ data }) => data >= inicioDados && data <= contexto.dataFimCiclo
    );
    const resultado = detectarPadraoTermico(elegiveis, config);
    return { ...resultado, modo: 'retrospectivo', inicioFiltro, cicloConcluido: true };
}

export { detectarA4R };
