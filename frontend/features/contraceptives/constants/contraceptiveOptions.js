const TIPOS_ANTICONCEPCIONAL = Object.freeze([
    { id: 'pilula', label: 'Pílula' },
    { id: 'injetavel', label: 'Injetável' },
    { id: 'adesivo', label: 'Adesivo' },
    { id: 'anel_vaginal', label: 'Anel Vaginal' },
    { id: 'diu_hormonal', label: 'DIU Hormonal' }
]);

const FREQUENCIAS_POR_TIPO = Object.freeze({
    pilula: Object.freeze([
        { id: 'pilula_21_7', label: '21 dias com pílula, 7 sem pílula', periodicidade: 'diaria', diasUso: 21, diasPausa: 7 },
        { id: 'pilula_24_4', label: '24 dias com pílula, 4 sem pílula', periodicidade: 'diaria', diasUso: 24, diasPausa: 4 },
        { id: 'pilula_12_1', label: '12 semanas com pílula, 1 sem pílula', periodicidade: 'diaria', diasUso: 84, diasPausa: 7 },
        { id: 'pilula_continuo', label: 'Contínuo', periodicidade: 'diaria', continuo: true }
    ]),
    injetavel: Object.freeze([
        { id: 'injetavel_mensal', label: 'Mensal', periodicidade: 'mensal', intervaloMeses: 1 },
        { id: 'injetavel_bimestral', label: 'A cada 2 meses', periodicidade: 'mensal', intervaloMeses: 2 },
        { id: 'injetavel_trimestral', label: 'A cada 3 meses', periodicidade: 'mensal', intervaloMeses: 3 }
    ]),
    adesivo: Object.freeze([
        { id: 'adesivo_continuo', label: 'Contínuo', periodicidade: 'semanal', continuo: true },
        { id: 'adesivo_3_1', label: '3 semanas com adesivo, 1 semana sem', periodicidade: 'semanal', diasUso: 21, diasPausa: 7 }
    ]),
    anel_vaginal: Object.freeze([
        { id: 'anel_21', label: 'Contínuo por 21 dias com anel', periodicidade: 'mensal', diasUso: 21, continuo: true },
        { id: 'anel_28', label: 'Contínuo por 28 dias com anel', periodicidade: 'mensal', diasUso: 28, continuo: true },
        { id: 'anel_3_1', label: '3 semanas com anel, 1 semana sem anel', periodicidade: 'mensal', diasUso: 21, diasPausa: 7 }
    ]),
    diu_hormonal: Object.freeze([])
});

const INTENSIDADES_ALERTA = Object.freeze([
    { id: 'leve', label: 'Leve', descricao: 'DESCRIÇÃO' },
    { id: 'moderado', label: 'Moderado', descricao: 'DESCRIÇÃO' },
    { id: 'critico', label: 'Crítico', descricao: 'DESCRIÇÃO' }
]);

function obterTipo(id) {
    return TIPOS_ANTICONCEPCIONAL.find((tipo) => tipo.id === id) ?? null;
}

function obterFrequencias(tipo) {
    return FREQUENCIAS_POR_TIPO[tipo] ?? [];
}

function obterFrequencia(tipo, id) {
    return obterFrequencias(tipo).find((frequencia) => frequencia.id === id) ?? null;
}

export { FREQUENCIAS_POR_TIPO, INTENSIDADES_ALERTA, TIPOS_ANTICONCEPCIONAL, obterFrequencia, obterFrequencias, obterTipo };
