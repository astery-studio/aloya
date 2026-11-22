const cicloESangramento = {
    id: 'ciclo_sangramento',
    nome: 'Ciclo e Sangramento',
    categorias: [
        {
            id: 'fluxo_menstrual',
            nome: 'Fluxo menstrual',
            grupos: [
                {
                    id: 'intensidade',
                    opcoes: [
                        'Ausente',
                        'Muito leve',
                        'Leve',
                        'Moderado',
                        'Intenso',
                        'Muito intenso',
                        'Variável'
                    ]
                },
                { id: 'coagulos', opcoes: ['Pequenos', 'Médios', 'Grandes', 'Nenhum', 'Muitos'] },
                { id: 'aspecto', opcoes: ['Vermelho vivo', 'Vermelho escuro', 'Marrom', 'Rosado'] }
            ]
        },
        {
            id: 'sangramento_escape',
            nome: 'Sangramento de escape',
            grupos: [
                {
                    id: 'cor',
                    opcoes: [
                        'Vermelho vivo',
                        'Vermelho escuro',
                        'Marrom',
                        'Rosado',
                        'Vermelho amarronzado'
                    ]
                },
                {
                    id: 'intensidade',
                    opcoes: [
                        'Apenas ao se limpar',
                        'Pequenas manchas',
                        'Leve',
                        'Moderado',
                        'Intenso'
                    ]
                }
            ]
        },
        {
            id: 'secrecao_corrimento',
            nome: 'Secreção/corrimento',
            grupos: [
                { id: 'presenca', opcoes: ['Nenhuma', 'Pouca', 'Moderada', 'Abundante'] },
                {
                    id: 'consistencia',
                    opcoes: [
                        'Aquosa',
                        'Elástica',
                        'Viscosa',
                        'Pastosa',
                        'Cremosa',
                        'Grumosa',
                        'Clara de ovo (elástica e transparente)'
                    ]
                },
                {
                    id: 'cor',
                    opcoes: [
                        'Transparente',
                        'Branca',
                        'Cinza',
                        'Branco-amarelada',
                        'Amarelada',
                        'Rosada',
                        'Marrom',
                        'Esverdeada'
                    ]
                },
                {
                    id: 'caracteristicas',
                    opcoes: [
                        'Sem odor',
                        'Odor diferente do habitual',
                        'Odor forte',
                        'Aspecto espumoso',
                        'Presença de sangue',
                        'Pequenos grumos'
                    ]
                }
            ]
        }
    ]
};

export { cicloESangramento };
