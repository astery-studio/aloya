import { cores } from './colors';
import { espacamentos, espacamentosLayout } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { typography } from './typography';
import { MODOS_TEMA } from './themePreferences';

const interfaceClara = Object.freeze({
    fundo: '#F7F5F0',
    superficie: '#FFFFFF',
    superficieElevada: '#FFFFFF',
    textoPrincipal: '#222222',
    textoSecundario: '#5C5C59',
    textoDesabilitado: '#777772',
    borda: '#E6E2D8',
    separador: '#EDEAE4',
    switchInativo: '#D8D4CC',
    sobreposicao: 'rgba(34, 34, 34, 0.48)',
    barraStatus: 'dark'
});

const interfaceEscura = Object.freeze({
    fundo: '#181C1A',
    superficie: '#232926',
    superficieElevada: '#2B322E',
    textoPrincipal: '#F4F1EA',
    textoSecundario: '#C4C8C5',
    textoDesabilitado: '#A3A8A5',
    borda: '#4A514D',
    separador: '#353C38',
    switchInativo: '#656B67',
    sobreposicao: 'rgba(0, 0, 0, 0.68)',
    barraStatus: 'light'
});

function criarTema(modo, coresInterface) {
    const coresDoTema = Object.freeze({
        ...cores,
        interface: coresInterface
    });

    return Object.freeze({
        modo,
        escuro: modo === MODOS_TEMA.escuro,
        cores: coresDoTema,
        espacamentos,
        espacamentosLayout,
        typography,
        radius,
        shadows
    });
}

const temaClaro = criarTema(MODOS_TEMA.claro, interfaceClara);

const temaEscuro = criarTema(MODOS_TEMA.escuro, interfaceEscura);

const temasPorModo = Object.freeze({
    [MODOS_TEMA.claro]: temaClaro,

    [MODOS_TEMA.escuro]: temaEscuro
});

function obterTemaPorModo(modo) {
    return temasPorModo[modo] || temaClaro;
}

export { interfaceClara, interfaceEscura, obterTemaPorModo, temaClaro, temaEscuro };
