import { useMemo } from 'react';
import { useTheme } from '../../../shared/hooks/useTheme';
import { coresNoturnasConteudo } from '../../../shared/theme/coresNoturnasConteudo';

const paleta = coresNoturnasConteudo;
const correspondencias = {
    '#2C4C3B': paleta.verde,
    '#567062': paleta.verde,
    '#C85A44': paleta.coral,
    '#B07D2A': paleta.amarelo,
    '#4A758E': paleta.azul,
    '#7B5EA7': '#B39DDB',
    '#222222': paleta.textoPrincipal,
    '#5C5C59': paleta.textoSecundario,
    '#847F76': paleta.textoSecundario,
    '#A8A49C': paleta.textoSecundario,
    '#AAAAA5': paleta.textoSecundario,
    '#FDF6F3': paleta.fundo,
    '#E6E2D8': paleta.borda,
    '#ECDCC8': paleta.borda
};

const superficies = {
    '#FFFFFF': paleta.superficie,
    '#F7F5F0': paleta.fundo,
    '#E8F0F3': 'rgba(144, 202, 249, 0.10)',
    '#FDF0EC': 'rgba(194, 110, 95, 0.10)'
};

function canaisRgb(hex) {
    return [1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16)).join(', ');
}

const tonsComOpacidade = Object.fromEntries(
    Object.entries({ ...correspondencias, '#FFFFFF': paleta.superficie })
        .filter(([, cor]) => cor.startsWith('#'))
        .map(([claro, escuro]) => [canaisRgb(claro), canaisRgb(escuro)])
);

function corNoturna(cor, propriedade) {
    if (typeof cor !== 'string') return cor;
    const chave = cor.toUpperCase();
    if (propriedade === 'backgroundColor' && Object.hasOwn(superficies, chave)) {
        return superficies[chave];
    }
    if (Object.hasOwn(correspondencias, chave)) return correspondencias[chave];

    const rgba = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i.exec(cor);
    if (!rgba) return cor;
    const rgb = rgba.slice(1, 4).join(', ');
    const escuro = tonsComOpacidade[rgb];
    return escuro ? `rgba(${escuro}, ${rgba[4]})` : cor;
}

function corClara(cor) {
    return cor;
}

function useHomeColors(estilosClaros) {
    const { escuro } = useTheme();
    return useMemo(() => {
        const cor = escuro ? corNoturna : corClara;
        const estilos =
            escuro && estilosClaros
                ? Object.fromEntries(
                      Object.entries(estilosClaros).map(([nome, estilo]) => [
                          nome,
                          Object.fromEntries(
                              Object.entries(estilo).map(([propriedade, valor]) => [
                                  propriedade,
                                  propriedade === 'color' || propriedade.endsWith('Color')
                                      ? cor(valor, propriedade)
                                      : valor
                              ])
                          )
                      ])
                  )
                : estilosClaros;
        return { estilos, cor, escuro };
    }, [escuro, estilosClaros]);
}

export { useHomeColors };
