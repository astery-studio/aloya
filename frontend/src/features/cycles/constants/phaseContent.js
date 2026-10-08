const dicasPadrao = Object.freeze([
    'Observe como seu corpo está se sentindo hoje.',
    'Reserve alguns minutos para descansar.',
    'Continue registrando suas percepções ao longo do ciclo.'
]);

const conteudoPorFase = Object.freeze({
    menstrual: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'O ciclo recomeça. O corpo libera o revestimento uterino durante a menstruação.',
        sintomas: ['Sensação de cansaço', 'Sensibilidade corporal', 'Menor disposição', 'Alterações de humor'],
        dicas: dicasPadrao
    },
    folicular: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'O ciclo recomeça e o corpo se prepara gradualmente para uma nova ovulação.',
        sintomas: ['Aumento de energia', 'Pele mais equilibrada', 'Mais disposição', 'Alterações de humor'],
        dicas: dicasPadrao
    },
    ovulatoria: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'O óvulo é liberado e o corpo atinge um ponto de maior fertilidade estimada.',
        sintomas: ['Pico de energia', 'Sensibilidade corporal', 'Alterações de temperatura', 'Mais sociabilidade'],
        dicas: dicasPadrao
    },
    lutea: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'Após a ovulação, o corpo entra em uma fase de transição antes do próximo ciclo.',
        sintomas: ['Alterações de energia', 'Sensibilidade corporal', 'Alterações de humor', 'Retenção de líquidos'],
        dicas: dicasPadrao
    }
});

export { conteudoPorFase };
