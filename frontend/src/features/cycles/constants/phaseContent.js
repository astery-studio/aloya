const conteudoPorFase = Object.freeze({
    menstrual: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'O ciclo recomeça. O corpo elimina o revestimento uterino durante a menstruação.',
        sintomas: ['Sensação de cansaço', 'Sensibilidade corporal', 'Menor disposição', 'Alterações de humor'],
        dicas: ['Observe como seu corpo está se sentindo hoje.', 'Reserve alguns minutos para descansar.', 'Continue registrando suas percepções ao longo do ciclo.']
    },
    folicular: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'Após a menstruação, o corpo se prepara gradualmente para uma nova ovulação.',
        sintomas: ['Aumento de energia', 'Pele mais equilibrada', 'Mais disposição', 'Alterações de humor'],
        dicas: ['Observe como seu corpo está se sentindo hoje.', 'Aproveite o aumento gradual de energia.', 'Continue registrando suas percepções ao longo do ciclo.']
    },
    ovulatoria: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'A ovulação estimada marca o período de maior fertilidade previsto pelo calendário.',
        sintomas: ['Pico de energia', 'Sensibilidade corporal', 'Alterações de temperatura', 'Mais sociabilidade'],
        dicas: ['Observe as mudanças do seu corpo.', 'Mantenha seus registros atualizados.', 'Lembre-se de que as datas são apenas estimativas.']
    },
    lutea: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'Após a ovulação estimada, o corpo entra na fase que antecede o próximo ciclo.',
        sintomas: ['Alterações de energia', 'Retenção de líquidos', 'Sensibilidade corporal', 'Alterações de humor'],
        dicas: ['Observe como seu corpo está se sentindo hoje.', 'Priorize descanso e bem-estar.', 'Continue registrando suas percepções ao longo do ciclo.']
    }
});

export { conteudoPorFase };
