import {
    interfaceClara,
    interfaceEscura,
    obterTemaPorModo,
    temaClaro,
    temaEscuro
} from '../../../src/shared/theme/themePalettes';
import { MODOS_TEMA } from '../../../src/shared/theme/themePreferences';

function converterHexParaRgb(cor) {
    const valor = cor.replace('#', '');

    return {
        vermelho: Number.parseInt(valor.slice(0, 2), 16),

        verde: Number.parseInt(valor.slice(2, 4), 16),

        azul: Number.parseInt(valor.slice(4, 6), 16)
    };
}

function normalizarCanal(canal) {
    const valor = canal / 255;

    return valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4;
}

function obterLuminancia(cor) {
    const { vermelho, verde, azul } = converterHexParaRgb(cor);

    return (
        0.2126 * normalizarCanal(vermelho) +
        0.7152 * normalizarCanal(verde) +
        0.0722 * normalizarCanal(azul)
    );
}

function calcularContraste(primeiraCor, segundaCor) {
    const primeiraLuminancia = obterLuminancia(primeiraCor);

    const segundaLuminancia = obterLuminancia(segundaCor);

    const maior = Math.max(primeiraLuminancia, segundaLuminancia);

    const menor = Math.min(primeiraLuminancia, segundaLuminancia);

    return (maior + 0.05) / (menor + 0.05);
}

describe('themePalettes', () => {
    test('retorna o tema correspondente ao modo informado', () => {
        expect(obterTemaPorModo(MODOS_TEMA.claro)).toBe(temaClaro);

        expect(obterTemaPorModo(MODOS_TEMA.escuro)).toBe(temaEscuro);
    });

    test('usa o tema claro como fallback seguro', () => {
        expect(obterTemaPorModo('desconhecido')).toBe(temaClaro);

        expect(obterTemaPorModo()).toBe(temaClaro);
    });

    test('identifica corretamente cada modo', () => {
        expect(temaClaro.modo).toBe(MODOS_TEMA.claro);

        expect(temaClaro.escuro).toBe(false);

        expect(temaEscuro.modo).toBe(MODOS_TEMA.escuro);

        expect(temaEscuro.escuro).toBe(true);
    });

    test('mantém os contratos compartilhados nos dois temas', () => {
        for (const tema of [temaClaro, temaEscuro]) {
            expect(tema.espacamentos).toBeDefined();

            expect(tema.espacamentosLayout).toBeDefined();

            expect(tema.typography).toBeDefined();

            expect(tema.radius).toBeDefined();

            expect(tema.shadows).toBeDefined();

            expect(tema.cores.marca).toBeDefined();

            expect(tema.cores.feedback).toBeDefined();

            expect(tema.cores.interface).toBeDefined();
        }
    });

    test.each([
        ['claro', interfaceClara],
        ['escuro', interfaceEscura]
    ])('garante contraste mínimo no tema %s', (_nome, paleta) => {
        const combinacoes = [
            [paleta.textoPrincipal, paleta.fundo],
            [paleta.textoPrincipal, paleta.superficie],
            [paleta.textoSecundario, paleta.fundo],
            [paleta.textoSecundario, paleta.superficie]
        ];

        for (const [texto, fundo] of combinacoes) {
            expect(calcularContraste(texto, fundo)).toBeGreaterThanOrEqual(4.5);
        }
    });

    test('usa conteúdo claro na barra de status escura', () => {
        expect(interfaceEscura.barraStatus).toBe('light');
    });

    test('usa conteúdo escuro na barra de status clara', () => {
        expect(interfaceClara.barraStatus).toBe('dark');
    });

    test('protege temas e paletas contra alterações', () => {
        for (const valor of [
            interfaceClara,
            interfaceEscura,
            temaClaro,
            temaEscuro,
            temaClaro.cores,
            temaEscuro.cores
        ]) {
            expect(Object.isFrozen(valor)).toBe(true);
        }
    });
});
