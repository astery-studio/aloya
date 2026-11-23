const emocional = {
    id: 'emocional',
    nome: 'Emocional',
    categorias: [
        {
            id: 'sintomas_emocionais',
            nome: 'Sintomas emocionais',
            grupos: [
                {
                    id: 'agradaveis',
                    opcoes: [
                        'Feliz',
                        'Alegre',
                        'Animado',
                        'Tranquilo',
                        'Motivado',
                        'Otimista',
                        'Carinhoso',
                        'Inspirado',
                        'Eufórico',
                        'Esperançoso'
                    ]
                },
                {
                    id: 'neutros',
                    opcoes: [
                        'Indiferente',
                        'Apático',
                        'Reflexivo',
                        'Nostálgico',
                        'Confuso',
                        'Estável'
                    ]
                },
                {
                    id: 'desagradaveis',
                    opcoes: [
                        'Sensível',
                        'Preocupado',
                        'Culpado',
                        'Triste',
                        'Ansioso',
                        'Irritado',
                        'Sobrecarregado',
                        'Decepcionado',
                        'Desmotivado',
                        'Melancólico',
                        'Envergonhado',
                        'Impaciente',
                        'Frustrado',
                        'Inseguro',
                        'Solitário',
                        'Estressado',
                        'Desanimado'
                    ]
                }
            ]
        },
        {
            id: 'sintomas_pre_menstruais',
            nome: 'Sintomas pré-menstruais',
            grupos: [
                {
                    id: 'sintomas',
                    opcoes: [
                        'Ansiedade',
                        'Tristeza',
                        'Choro fácil',
                        'Insegurança',
                        'Diminuição da motivação',
                        'Sensibilidade emocional',
                        'Desânimo',
                        'Irritabilidade',
                        'Oscilações de humor',
                        'Impaciência',
                        'Nervosismo',
                        'Dificuldade para tomar decisões',
                        'Maior sensibilidade a críticas',
                        'Dificuldade de concentração',
                        'Aumento da preocupação',
                        'Sobrecarga emocional'
                    ]
                }
            ]
        }
    ]
};

export { emocional };
