import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { WavesIcon } from 'phosphor-react-native/src/icons/Waves';
import { DropIcon, SunIcon } from '../../../shared/components/icons/AppIcons';

const CONTEUDOS_EDUCATIVOS = Object.freeze({
    menstrual: {
        label: 'Menstrual',
        titulo: 'Fase menstrual',
        texto: 'Quando não ocorre uma gravidez, o útero elimina parte do seu revestimento interno, dando início à menstruação.',
        cor: '#C85A44',
        weight: 'fill',
        Icone: DropIcon
    },
    folicular: {
        label: 'Folicular',
        titulo: 'Fase folicular',
        texto: 'Os folículos se desenvolvem enquanto o corpo se prepara gradualmente para a ovulação.',
        cor: '#2C4C3B',
        weight: 'regular',
        Icone: PlantIcon
    },
    ovulatoria: {
        label: 'Ovulatória',
        titulo: 'Fase ovulatória',
        texto: 'O ovário libera um óvulo, marcando a fase de maior fertilidade estimada do ciclo.',
        cor: '#4A758E',
        weight: 'regular',
        Icone: SunIcon
    },
    lutea: {
        label: 'Lútea',
        titulo: 'Fase lútea',
        texto: 'Depois da ovulação, o corpo se prepara para o próximo ciclo e a energia pode mudar gradualmente.',
        cor: '#D68C3A',
        weight: 'regular',
        Icone: WavesIcon
    }
});

export { CONTEUDOS_EDUCATIVOS };
