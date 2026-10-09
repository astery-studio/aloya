const dicasPadrao = Object.freeze([
    'Observe como seu corpo está se sentindo hoje.',
    'Reserve alguns minutos para descansar.',
    'Continue registrando suas percepções ao longo do ciclo.'
]);

const conteudoPorFase = Object.freeze({
    menstrual: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'O ciclo recomeça. O corpo libera o revestimento uterino e a energia tende a se voltar para dentro. É um bom momento para reduzir o ritmo e observar como você se sente.',
        sintomas: ['Sensação de cansaço', 'Sensibilidade corporal', 'Menor disposição', 'Alterações de humor'],
        dicas: dicasPadrao
    },
    folicular: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'Os níveis hormonais começam a subir e muitas pessoas relatam mais disposição e clareza. É uma janela em que o corpo se prepara gradualmente para a ovulação.',
        sintomas: ['Aumento de energia', 'Pele mais equilibrada', 'Mais disposição', 'Alterações de humor'],
        dicas: dicasPadrao
    },
    ovulatoria: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'O óvulo é liberado e o corpo atinge um ponto de maior expansão no ciclo. É a fase em que a fertilidade estimada é mais alta.',
        sintomas: ['Pico de energia', 'Sensibilidade corporal', 'Alterações de temperatura', 'Mais sociabilidade'],
        dicas: dicasPadrao
    },
    lutea: {
        tituloExplicacao: 'Sobre sua fase',
        descricao: 'Após a ovulação, o corpo entra em uma fase de transição. A energia costuma diminuir gradualmente conforme o ciclo se aproxima do fim.',
        sintomas: ['Alterações de energia', 'Alterações de humor', 'Sensibilidade corporal', 'Retenção de líquidos'],
        dicas: dicasPadrao
    }
});

export { conteudoPorFase };
