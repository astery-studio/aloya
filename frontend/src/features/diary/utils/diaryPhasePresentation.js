import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { WavesIcon } from 'phosphor-react-native/src/icons/Waves';

const FASES_DIARIO = Object.freeze({
    menstruacao: {
        rotulo: 'Fase Menstrual',
        cor: '#C85A44',
        fundoIcone: 'rgba(200, 90, 68, 0.10)',
        fundo: 'rgba(200, 90, 68, 0.20)',
        Icone: DropIcon
    },
    folicular: {
        rotulo: 'Fase Folicular',
        cor: '#3B7150',
        fundoIcone: 'rgba(59, 113, 80, 0.10)',
        fundo: 'rgba(59, 113, 80, 0.16)',
        Icone: PlantIcon
    },
    ovulacao: {
        rotulo: 'Fase Ovulatória',
        cor: '#4A758E',
        fundoIcone: 'rgba(74, 117, 142, 0.10)',
        fundo: 'rgba(74, 117, 142, 0.16)',
        Icone: SunIcon
    },
    lutea: {
        rotulo: 'Fase Lútea',
        cor: '#B06D2A',
        fundoIcone: 'rgba(176, 109, 42, 0.10)',
        fundo: 'rgba(176, 109, 42, 0.16)',
        Icone: WavesIcon
    }
});

const ALIASES_FASE = Object.freeze({
    menstrual: 'menstruacao',
    ovulatoria: 'ovulacao'
});

const FASE_INDEFINIDA_DIARIO = Object.freeze({
    rotulo: 'Fase não identificada',
    cor: '#6B6B66',
    fundoIcone: 'rgba(107, 107, 102, 0.10)',
    fundo: 'rgba(107, 107, 102, 0.14)',
    Icone: QuestionIcon
});

function obterApresentacaoFase(fase) {
    const faseNormalizada = ALIASES_FASE[fase] ?? fase;
    return FASES_DIARIO[faseNormalizada] ?? null;
}

// Registros antigos podem não ter uma fase associada; mantém o item visível sem inferir dados.
function obterApresentacaoFaseRegistro(fase) {
    return fase === null ? FASE_INDEFINIDA_DIARIO : obterApresentacaoFase(fase);
}

export {
    ALIASES_FASE,
    FASE_INDEFINIDA_DIARIO,
    FASES_DIARIO,
    obterApresentacaoFase,
    obterApresentacaoFaseRegistro
};
