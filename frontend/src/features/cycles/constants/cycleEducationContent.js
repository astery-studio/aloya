import {
    DropIcon,
    FlowerTulipIcon,
    SunIcon,
    ArrowsClockwiseIcon
} from '../../../shared/components/icons/AppIcons';

const CONTEUDOS_EDUCATIVOS = Object.freeze({
    menstrual: {
        label: 'Menstrual',
        titulo: 'Fase menstrual',
        texto: 'Quando não ocorre uma gravidez, o útero elimina parte do seu revestimento interno, dando início à menstruação.',
        cor: '#C85A44',
        fundo: 'rgba(200, 90, 68, 0.1)',
        Icone: DropIcon
    },
    folicular: {
        label: 'Folicular',
        titulo: 'Fase folicular',
        texto: 'Os folículos se desenvolvem enquanto o corpo se prepara gradualmente para a ovulação.',
        cor: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.1)',
        Icone: FlowerTulipIcon
    },
    ovulatoria: {
        label: 'Ovulatória',
        titulo: 'Fase ovulatória',
        texto: 'O ovário libera um óvulo, marcando a fase de maior fertilidade estimada do ciclo.',
        cor: '#4A758E',
        fundo: 'rgba(74, 117, 142, 0.1)',
        Icone: SunIcon
    },
    lutea: {
        label: 'Lútea',
        titulo: 'Fase lútea',
        texto: 'Depois da ovulação, o corpo se prepara para o próximo ciclo e a energia pode mudar gradualmente.',
        cor: '#D68C3A',
        fundo: 'rgba(214, 140, 58, 0.1)',
        Icone: ArrowsClockwiseIcon
    }
});

export { CONTEUDOS_EDUCATIVOS };
