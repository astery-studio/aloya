const corpoESintomas = {
    id: 'corpo_sintomas_fisicos',
    nome: 'Corpo e Sintomas Físicos',
    categorias: [
        {
            id: 'sintomas_fisicos',
            nome: 'Sintomas físicos',
            grupos: [
                {
                    id: 'sintomas',
                    opcoes: [
                        'Cólicas leves',
                        'Cólicas moderadas',
                        'Cólicas intensas',
                        'Cansaço excessivo',
                        'Sensação de calor',
                        'Dor nas articulações',
                        'Inchaço',
                        'Tontura',
                        'Dor pélvica',
                        'Fraqueza',
                        'Calafrios',
                        'Fadiga',
                        'Retenção de líquidos',
                        'Sensibilidade',
                        'Enxaqueca com aura',
                        'Dor lombar',
                        'Dor nas costas',
                        'Dor nas pernas',
                        'Dor muscular',
                        'Tensão muscular',
                        'Dor de cabeça',
                        'Enxaqueca'
                    ]
                }
            ]
        },
        {
            id: 'pele',
            nome: 'Pele',
            grupos: [
                {
                    id: 'caracteristicas',
                    opcoes: [
                        'Muito oleosa',
                        'Seca',
                        'Ressecada',
                        'Acne',
                        'Espinhas',
                        'Cravos',
                        'Normal',
                        'Oleosa',
                        'Mista',
                        'Sensibilidade',
                        'Vermelhidão',
                        'Irritação',
                        'Manchas',
                        'Inchaço',
                        'Coceira',
                        'Descamação'
                    ]
                }
            ]
        },
        {
            id: 'cabelo',
            nome: 'Cabelo',
            grupos: [
                {
                    id: 'caracteristicas',
                    opcoes: [
                        'Sem alterações',
                        'Macio',
                        'Oleoso',
                        'Volumoso',
                        'Ressecado',
                        'Frágil',
                        'Frizz',
                        'Quebradiço',
                        'Queda',
                        'Descamação'
                    ]
                }
            ]
        },
        {
            id: 'digestao',
            nome: 'Digestão',
            grupos: [
                {
                    id: 'sintomas',
                    opcoes: [
                        'Sem alterações',
                        'Gases',
                        'Arrotos',
                        'Azia',
                        'Refluxo',
                        'Vômitos',
                        'Perda de apetite',
                        'Aumento do apetite',
                        'Saciedade',
                        'Fome frequente',
                        'Inchaço'
                    ]
                }
            ]
        },
        {
            id: 'banheiro',
            nome: 'Banheiro',
            grupos: [
                {
                    id: 'intestino',
                    opcoes: [
                        'Normal',
                        'Dor',
                        'Prisão de ventre',
                        'Diarreia',
                        'Urgência para evacuar',
                        'Dificuldade para evacuar',
                        'Evacuação frequente'
                    ]
                },
                {
                    id: 'urina',
                    opcoes: [
                        'Normal',
                        'Vazamento',
                        'Ardência',
                        'Dificuldade para iniciar a micção',
                        'Dor',
                        'Alteração na cor',
                        'Urgência para urinar',
                        'Odor diferente',
                        'Micção frequente',
                        'Sensação de esvaziamento incompleto'
                    ]
                }
            ]
        },
        {
            id: 'regiao_genital',
            nome: 'Região genital',
            grupos: [
                {
                    id: 'sintomas',
                    opcoes: [
                        'Sem alterações',
                        'Dor',
                        'Coceira',
                        'Ressecamento',
                        'Ardência',
                        'Vermelhidão',
                        'Inchaço',
                        'Irritação',
                        'Sensibilidade'
                    ]
                }
            ]
        },
        {
            id: 'torax_peito',
            nome: 'Tórax/peito',
            grupos: [
                {
                    id: 'sintomas',
                    opcoes: [
                        'Sem alterações',
                        'Dor',
                        'Inchaço',
                        'Sensibilidade',
                        'Dor nos mamilos',
                        'Sensibilidade nos mamilos',
                        'Coceira'
                    ]
                }
            ]
        },
        {
            id: 'temperatura_basal',
            nome: 'Temperatura basal',
            tipoValor: 'decimal_escalado',
            unidade: '°C',
            casasDecimais: 1,
            valorMinimo: '32.0',
            valorMaximo: '42.0',
            aceitaPerturbacao: true
        },
        { id: 'peso', nome: 'Peso', tipoValor: 'decimal_escalado', unidade: 'kg', casasDecimais: 1 }
    ]
};

export { corpoESintomas };
