import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { WavesIcon } from 'phosphor-react-native/src/icons/Waves';
import { coresNoturnasConteudo } from '../../../shared/theme/coresNoturnasConteudo';

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
        cor: '#567062',
        fundoIcone: 'rgba(86, 112, 98, 0.10)',
        fundo: 'rgba(86, 112, 98, 0.20)',
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
        cor: '#D68C3A',
        fundoIcone: 'rgba(214, 140, 58, 0.10)',
        fundo: 'rgba(214, 140, 58, 0.20)',
        Icone: WavesIcon,
        pesoIcone: 'regular'
    }
});

const FASES_DIARIO_ESCURAS = Object.freeze({
    menstruacao: {
        ...FASES_DIARIO.menstruacao,
        cor: coresNoturnasConteudo.coral,
        fundoIcone: 'rgba(194, 110, 95, 0.10)',
        fundo: 'rgba(194, 110, 95, 0.20)',
        textoContador: 'rgba(194, 110, 95, 0.80)'
    },
    folicular: {
        ...FASES_DIARIO.folicular,
        cor: coresNoturnasConteudo.verde,
        fundoIcone: 'rgba(165, 214, 167, 0.10)',
        fundo: 'rgba(165, 214, 167, 0.20)',
        textoContador: 'rgba(165, 214, 167, 0.80)'
    },
    ovulacao: {
        ...FASES_DIARIO.ovulacao,
        cor: '#D68C3A',
        fundoIcone: 'rgba(214, 140, 58, 0.10)',
        fundo: 'rgba(214, 140, 58, 0.20)',
        textoContador: 'rgba(214, 140, 58, 0.80)'
    },
    lutea: {
        ...FASES_DIARIO.lutea,
        textoContador: 'rgba(214, 140, 58, 0.80)'
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
