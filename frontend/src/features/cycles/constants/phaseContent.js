import dicasPorFase from './cycleSelfCareTips.json';

const conteudoPorFase = Object.freeze({
    menstrual: {
        tituloExplicacao: 'O início de um novo ciclo',
        descricao:
            'Quando não ocorre uma gravidez, a queda dos hormônios estrogênio e progesterona faz com que o útero elimine parte de seu revestimento interno, chamado endométrio. Esse tecido sai do corpo junto com o sangue menstrual. O primeiro dia da menstruação marca o início de um novo ciclo.',
        sintomas: [
            'Sensação de cansaço',
            'Sensibilidade corporal',
            'Menor disposição',
            'Alterações de humor'
        ],
        dicas: dicasPorFase.menstrual.map(({ body }) => body)
    },
    folicular: {
        tituloExplicacao: 'Preparação para a ovulação',
        descricao:
            'Durante essa fase, pequenos folículos nos ovários começam a se desenvolver, e geralmente um deles amadurece para liberar um óvulo. Ao mesmo tempo, os níveis de estrogênio aumentam, estimulando a reconstrução e o crescimento do revestimento interno do útero. É a preparação do corpo para a ovulação.',
        sintomas: [
            'Aumento de energia',
            'Pele mais equilibrada',
            'Mais disposição',
            'Alterações de humor'
        ],
        dicas: dicasPorFase.folicular.map(({ body }) => body)
    },
    ovulatoria: {
        tituloExplicacao: 'A liberação do óvulo',
        descricao:
            'A ovulação acontece quando um dos ovários libera um óvulo amadurecido, após um aumento do hormônio LH. O óvulo é captado pela tuba uterina, onde pode ser fecundado por um espermatozoide. Esse é o período de maior possibilidade de gravidez no ciclo, especialmente nos dias anteriores à ovulação e no próprio dia.',
        sintomas: [
            'Pico de energia',
            'Sensibilidade corporal',
            'Alterações de temperatura',
            'Mais sociabilidade'
        ],
        dicas: dicasPorFase.ovulatoria.map(({ body }) => body)
    },
    lutea: {
        tituloExplicacao: 'Preparação para uma possível gravidez',
        descricao:
            'Depois da ovulação, o folículo que liberou o óvulo se transforma em uma estrutura chamada corpo lúteo. Ela produz principalmente progesterona, um hormônio que ajuda a preparar e manter o revestimento do útero para uma possível gravidez. Se a gravidez não acontece, os níveis hormonais diminuem e uma nova menstruação começa.',
        sintomas: [
            'Alterações de energia',
            'Alterações de humor',
            'Sensibilidade corporal',
            'Retenção de líquidos'
        ],
        dicas: dicasPorFase.lutea.map(({ body }) => body)
    }
});

export { conteudoPorFase };
