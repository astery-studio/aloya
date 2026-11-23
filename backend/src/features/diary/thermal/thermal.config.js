const CONFIGURACAO_TERMICA_SOMBRA = Object.freeze({
    algoritmo: 'motor-termico',
    versao: '0.5.0-experimental',
    variante: 'A1',
    disponibilidade: 'B1',
    modo: 'causal',
    referencia: 'media',
    quantidadeReferencia: 6,
    janelaReferenciaDias: 6,
    elevacaoDecimos: 2,
    quantidadeElevada: 3,
    execucaoHabilitada: true,
    exposicaoHabilitada: false,
    retornoLinhaBase: Object.freeze({
        habilitado: true,
        quantidadeConsecutiva: 3,
        margemDecimos: 0
    }),
    aplicarEvidenciaNaConfianca: false
});

const DEFINICOES_CAUSAIS = Object.freeze([
    ['A1', 'B1', 'media', 2, 6],
    ['A1', 'B2', 'media', 2, 9],
    ['A2', 'B1', 'media', 3, 6],
    ['A2', 'B2', 'media', 3, 9],
    ['A4-C', 'B1', 'maxima', 2, 6],
    ['A4-C', 'B2', 'maxima', 2, 9]
]);

const CONFIGURACOES_TERMICAS_CAUSAIS = Object.freeze(
    DEFINICOES_CAUSAIS.map(([variante, disponibilidade, referencia, elevacaoDecimos, janela]) =>
        Object.freeze({
            ...CONFIGURACAO_TERMICA_SOMBRA,
            variante,
            disponibilidade,
            referencia,
            elevacaoDecimos,
            janelaReferenciaDias: janela
        })
    )
);

const CONFIGURACOES_TERMICAS_RETROSPECTIVAS = Object.freeze([
    Object.freeze({
        ...CONFIGURACAO_TERMICA_SOMBRA,
        variante: 'A3',
        modo: 'retrospectivo',
        referencia: 'menores_foliculares',
        elevacaoDecimos: 3,
        requerLimiteFolicularIndependente: true
    }),
    Object.freeze({
        ...CONFIGURACAO_TERMICA_SOMBRA,
        variante: 'A4-R',
        disponibilidade: 'B2',
        modo: 'retrospectivo',
        referencia: 'maxima',
        quantidadeReferencia: 5,
        filtrarUltimosDiasCiclo: 14
    })
]);

export {
    CONFIGURACAO_TERMICA_SOMBRA,
    CONFIGURACOES_TERMICAS_CAUSAIS,
    CONFIGURACOES_TERMICAS_RETROSPECTIVAS
};
