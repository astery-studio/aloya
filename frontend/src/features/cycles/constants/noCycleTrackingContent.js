import {
    CalendarDotsIcon,
    HeartIcon,
    PillIcon,
    SparkleIcon
} from '../../../shared/components/icons/AppIcons';

const RECURSOS_SEM_CICLO = Object.freeze([
    {
        id: 'ritmo',
        titulo: 'Entenda o ritmo do seu ciclo',
        subtitulo: 'Toque para explorar',
        texto: 'Com registros suficientes, você poderá acompanhar estimativas do próximo ciclo e observar variações entre seus ciclos.',
        Icone: CalendarDotsIcon,
        cor: '#C85A44',
        fundo: 'rgba(200, 90, 68, 0.1)'
    },
    {
        id: 'fertilidade',
        titulo: 'Conheça sua janela fértil estimada',
        subtitulo: 'Toque para explorar',
        texto: 'Explore os dias em que a possibilidade de gravidez pode ser maior, lembrando que previsões por calendário não confirmam ovulação.',
        Icone: SparkleIcon,
        cor: '#7B5EA7',
        fundo: 'rgba(123, 94, 167, 0.1)'
    },
    {
        id: 'sentimentos',
        titulo: 'Registre como você se sente',
        subtitulo: 'Toque para explorar',
        texto: 'Anote sintomas, sentimentos e percepções para reconhecer possíveis padrões ao longo do tempo.',
        Icone: HeartIcon,
        cor: '#4A758E',
        fundo: 'rgba(74, 117, 142, 0.1)'
    },
    {
        id: 'anticoncepcional',
        titulo: 'Acompanhe seu anticoncepcional',
        subtitulo: 'Toque para explorar',
        texto: 'Organize seus registros e acompanhe as informações do método contraceptivo que você utiliza.',
        Icone: PillIcon,
        cor: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.1)'
    }
]);

export { RECURSOS_SEM_CICLO };
