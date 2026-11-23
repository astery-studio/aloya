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
        Icone: DropIcon,
        pesoIcone: 'fill'
    },
    folicular: {
        rotulo: 'Fase Folicular',
        cor: '#3B7150',
        fundoIcone: 'rgba(59, 113, 80, 0.10)',
        fundo: 'rgba(59, 113, 80, 0.16)',
        Icone: PlantIcon,
        pesoIcone: 'regular'
    },
    ovulacao: {
        rotulo: 'Fase Ovulatória',
        cor: '#4A758E',
        fundoIcone: 'rgba(74, 117, 142, 0.10)',
        fundo: 'rgba(74, 117, 142, 0.16)',
        Icone: SunIcon,
        pesoIcone: 'regular'
    },
    lutea: {
        rotulo: 'Fase Lútea',
        cor: '#B06D2A',
        fundoIcone: 'rgba(176, 109, 42, 0.10)',
        fundo: 'rgba(176, 109, 42, 0.16)',
        Icone: WavesIcon,
        pesoIcone: 'regular'
    }
});

const FASES_DIARIO_ESCURAS = Object.freeze({
    menstruacao: {
        ...FASES_DIARIO.menstruacao,
        cor: '#EF9A9A',
        fundoIcone: 'rgba(239, 154, 154, 0.10)',
        fundo: 'rgba(239, 154, 154, 0.20)'
    },
    folicular: {
        ...FASES_DIARIO.folicular,
        cor: '#A5D6A7',
        fundoIcone: 'rgba(165, 214, 167, 0.10)',
        fundo: 'rgba(165, 214, 167, 0.20)'
    },
    ovulacao: {
        ...FASES_DIARIO.ovulacao,
        cor: '#90CAF9',
        fundoIcone: 'rgba(144, 202, 249, 0.10)',
        fundo: 'rgba(144, 202, 249, 0.20)'
    },
    lutea: {
        ...FASES_DIARIO.lutea,
        cor: '#FFE082',
        fundoIcone: 'rgba(255, 224, 130, 0.10)',
        fundo: 'rgba(255, 224, 130, 0.20)'
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
    Icone: QuestionIcon,
    pesoIcone: 'regular'
});

const FASE_INDEFINIDA_DIARIO_ESCURA = Object.freeze({
    ...FASE_INDEFINIDA_DIARIO,
    cor: '#999999',
    fundoIcone: 'rgba(255, 255, 255, 0.08)',
    fundo: 'rgba(255, 255, 255, 0.12)'
});

function obterApresentacaoFase(fase, tema) {
    const faseNormalizada = ALIASES_FASE[fase] ?? fase;
    const fases = tema?.escuro ? FASES_DIARIO_ESCURAS : FASES_DIARIO;
    return fases[faseNormalizada] ?? null;
}

// Registros antigos podem não ter uma fase associada; mantém o item visível sem inferir dados.
function obterApresentacaoFaseRegistro(fase, tema) {
    if (fase === null) return tema?.escuro ? FASE_INDEFINIDA_DIARIO_ESCURA : FASE_INDEFINIDA_DIARIO;
    return obterApresentacaoFase(fase, tema);
}

export {
    ALIASES_FASE,
    FASE_INDEFINIDA_DIARIO,
    FASE_INDEFINIDA_DIARIO_ESCURA,
    FASES_DIARIO,
    FASES_DIARIO_ESCURAS,
    obterApresentacaoFase,
    obterApresentacaoFaseRegistro
};
