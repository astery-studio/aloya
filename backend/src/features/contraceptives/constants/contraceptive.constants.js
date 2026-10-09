const TIPOS = new Set(['pilula', 'injetavel', 'adesivo', 'anel_vaginal', 'diu_hormonal']);
const INTENSIDADES = new Set(['leve', 'moderado', 'critico']);

const FREQUENCIAS = Object.freeze({
    pilula: Object.freeze({
        pilula_21_7: { valor: 'uso_21_dias_pausa_7_dias', periodicidade: 'diaria', diasUso: 21, diasPausa: 7 },
        pilula_24_4: { valor: 'uso_24_dias_pausa_4_dias', periodicidade: 'diaria', diasUso: 24, diasPausa: 4 },
        pilula_12_1: { valor: 'uso_12_semanas_pausa_1_semana', periodicidade: 'diaria', diasUso: 84, diasPausa: 7 },
        pilula_continuo: { valor: 'uso_continuo', periodicidade: 'diaria', continuo: true }
    }),
    injetavel: Object.freeze({
        injetavel_mensal: { valor: 'aplicacao_mensal', periodicidade: 'mensal', intervaloMeses: 1 },
        injetavel_bimestral: { valor: 'aplicacao_bimestral', periodicidade: 'mensal', intervaloMeses: 2 },
        injetavel_trimestral: { valor: 'aplicacao_trimestral', periodicidade: 'mensal', intervaloMeses: 3 }
    }),
    adesivo: Object.freeze({
        adesivo_continuo: { valor: 'uso_continuo', periodicidade: 'semanal', continuo: true },
        adesivo_3_1: { valor: 'uso_3_semanas_pausa_1_semana', periodicidade: 'semanal', diasUso: 21, diasPausa: 7 }
    }),
    anel_vaginal: Object.freeze({
        anel_21: { valor: 'uso_21_dias', periodicidade: 'mensal', diasUso: 21, continuo: true },
        anel_28: { valor: 'uso_28_dias', periodicidade: 'mensal', diasUso: 28, continuo: true },
        anel_3_1: { valor: 'uso_3_semanas_pausa_1_semana', periodicidade: 'mensal', diasUso: 21, diasPausa: 7 }
    }),
    diu_hormonal: Object.freeze({})
});

function obterFrequencia(tipo, identificador) {
    const opcoes = FREQUENCIAS[tipo] ?? {};
    return Object.entries(opcoes).find(([id, regra]) => id === identificador || regra.valor === identificador)?.[1] ?? null;
}

export { FREQUENCIAS, INTENSIDADES, TIPOS, obterFrequencia };
