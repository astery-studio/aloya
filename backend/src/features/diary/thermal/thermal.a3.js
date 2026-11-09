import { obterReferenciaFolicular } from './thermal.a3.reference.js';
import { adicionarDias } from './thermal.dates.js';
import { encontrarSequenciaFixa } from './thermal.fixedSequence.js';

function detectarA3(medicoes, config, contexto = {}) {
    const base = {
        algoritmo: config.algoritmo,
        versao: config.versao,
        variante: config.variante,
        disponibilidade: config.disponibilidade,
        modo: 'retrospectivo',
        sequencias: [],
        aplicarEvidenciaNaConfianca: false
    };
    if (!contexto.cicloConcluido || !contexto.dataLimiteFolicularIndependente) {
        return { ...base, estado: 'INCONCLUSIVO', motivo: 'REFERENCIA_INDEPENDENTE_AUSENTE' };
    }
    const referencia = obterReferenciaFolicular(
        medicoes,
        contexto.dataLimiteFolicularIndependente,
        config.quantidadeReferencia
    );
    if (!referencia) return { ...base, estado: 'DADOS_INSUFICIENTES', janelasAvaliaveis: 0 };
    const avaliacao = encontrarSequenciaFixa(
        medicoes,
        adicionarDias(contexto.dataLimiteFolicularIndependente, 1),
        contexto.dataFimCiclo,
        referencia,
        config
    );
    const estado = avaliacao.sequencia
        ? 'ELEVACAO_DETECTADA'
        : avaliacao.janelasAvaliaveis > 0
          ? 'NENHUMA_ELEVACAO_IDENTIFICADA'
          : 'DADOS_INSUFICIENTES';
    return {
        ...base,
        estado,
        janelasAvaliaveis: avaliacao.janelasAvaliaveis,
        sequencias: avaliacao.sequencia ? [avaliacao.sequencia] : [],
        referencia: referencia.map(({ data, valorDecimos }) => ({ data, valorDecimos }))
    };
}

export { detectarA3 };
