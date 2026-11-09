import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

const CORES_CLARAS = Object.freeze({
    categoria: Object.freeze({
        conteudo: '#A66314',
        fundo: 'rgba(214, 140, 58, 0.18)',
        borda: 'rgba(214, 140, 58, 0.34)'
    }),
    individual: Object.freeze({
        conteudo: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.14)',
        borda: 'rgba(44, 76, 59, 0.32)'
    })
});

const CORES_ESCURAS = Object.freeze({
    categoria: Object.freeze({
        conteudo: '#F2B45F',
        fundo: 'rgba(242, 180, 95, 0.16)',
        borda: 'rgba(242, 180, 95, 0.42)'
    }),
    individual: Object.freeze({
        conteudo: '#9FD6B6',
        fundo: 'rgba(159, 214, 182, 0.14)',
        borda: 'rgba(159, 214, 182, 0.4)'
    })
});

function criarEstilos() {
    return StyleSheet.create({
        container: {
            minWidth: 0,
            maxWidth: '100%',
            minHeight: 32,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            paddingVertical: 5,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderRadius: 10
        },

        texto: {
            minWidth: 0,
            flexShrink: 1,
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 20,
            includeFontPadding: false
        }
    });
}

function criarVariantes(tema) {
    const cores = tema.escuro ? CORES_ESCURAS : CORES_CLARAS;

    return Object.freeze(
        Object.fromEntries(
            Object.entries(cores).map(([tipo, paleta]) => [
                tipo,
                Object.freeze({
                    container: Object.freeze({
                        backgroundColor: paleta.fundo,
                        borderColor: paleta.borda
                    }),
                    conteudo: Object.freeze({
                        color: paleta.conteudo
                    })
                })
            ])
        )
    );
}

export { CORES_CLARAS, CORES_ESCURAS, criarEstilos, criarVariantes };
