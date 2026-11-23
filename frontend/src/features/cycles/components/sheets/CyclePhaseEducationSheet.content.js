import { DropIcon, FlowerTulipIcon, SunIcon } from '../../../../shared/components/icons/AppIcons';
import { WavesIcon } from 'phosphor-react-native/src/icons/Waves';

const AVISO_EDUCATIVO = 'Cada ciclo é único. Datas e fases aqui são estimativas educativas.';

const CONTEUDO_POR_FASE = Object.freeze({
    menstrual: Object.freeze({
        titulo: 'Um tempo de escuta',
        descricao:
            'A menstruação marca o início de um novo ciclo. Fluxo, duração e sensações variam entre pessoas e também entre ciclos.',
        cor: '#C85A44',
        fundo: 'rgba(200, 90, 68, 0.1)',
        Icone: DropIcon
    }),
    folicular: Object.freeze({
        titulo: 'Por que “folicular”?',
        descricao:
            'O nome vem dos folículos, pequenas estruturas nos ovários onde os óvulos se desenvolvem. Um deles geralmente se torna dominante antes da ovulação.',
        cor: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.1)',
        Icone: FlowerTulipIcon
    }),
    ovulatoria: Object.freeze({
        titulo: 'Um centro de energia',
        descricao:
            'Na ovulação, um óvulo pode ser liberado pelo ovário. A data é uma estimativa e pode variar mesmo em ciclos considerados regulares.',
        cor: '#4A758E',
        fundo: 'rgba(74, 117, 142, 0.1)',
        Icone: SunIcon
    }),
    lutea: Object.freeze({
        titulo: 'Um tempo de acolhimento',
        descricao:
            'Na fase lútea, sensações físicas e emocionais podem mudar. Registrar padrões ajuda a compreender o próprio ritmo sem transformar sinais em diagnósticos.',
        cor: '#D68C3A',
        fundo: 'rgba(214, 140, 58, 0.1)',
        Icone: WavesIcon
    })
});

export { AVISO_EDUCATIVO, CONTEUDO_POR_FASE };
