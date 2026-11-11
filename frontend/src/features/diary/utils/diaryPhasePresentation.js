import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { WavesIcon } from 'phosphor-react-native/src/icons/Waves';

const FASES_DIARIO = Object.freeze({
    menstruacao: {
        rotulo: 'Fase Menstrual',
        cor: '#C85A44',
        fundo: 'rgba(200, 90, 68, 0.20)',
        Icone: DropIcon
    },
    folicular: {
        rotulo: 'Fase Folicular',
        cor: '#3B7150',
        fundo: 'rgba(59, 113, 80, 0.16)',
        Icone: PlantIcon
    },
    ovulacao: {
        rotulo: 'Fase Ovulatória',
        cor: '#4A758E',
        fundo: 'rgba(74, 117, 142, 0.16)',
        Icone: SunIcon
    },
    lutea: {
        rotulo: 'Fase Lútea',
        cor: '#B06D2A',
        fundo: 'rgba(176, 109, 42, 0.16)',
        Icone: WavesIcon
    }
});

function obterApresentacaoFase(fase) {
    return FASES_DIARIO[fase] ?? null;
}

export { FASES_DIARIO, obterApresentacaoFase };
