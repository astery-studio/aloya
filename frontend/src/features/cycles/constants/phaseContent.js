const conteudoPorFase = Object.freeze({
    menstrual: {
        descricao: 'O ciclo recomeça. O corpo elimina o revestimento uterino durante a menstruação.',
        sintomas: ['Sensação de cansaço', 'Sensibilidade corporal', 'Menor disposição', 'Alterações de humor']
    },
    folicular: {
        descricao: 'Após a menstruação, o corpo se prepara gradualmente para uma nova ovulação.',
        sintomas: ['Aumento de energia', 'Pele mais equilibrada', 'Mais disposição', 'Alterações de humor']
    },
    ovulatoria: {
        descricao: 'A ovulação estimada marca o período de maior fertilidade previsto pelo calendário.',
        sintomas: ['Pico de energia', 'Sensibilidade corporal', 'Alterações de temperatura', 'Mais sociabilidade']
    },
    lutea: {
        descricao: 'Após a ovulação estimada, o corpo entra na fase que antecede o próximo ciclo.',
        sintomas: ['Alterações de energia', 'Retenção de líquidos', 'Sensibilidade corporal', 'Alterações de humor']
    }
});

export { conteudoPorFase };
