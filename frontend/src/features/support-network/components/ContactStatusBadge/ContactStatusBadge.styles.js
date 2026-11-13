import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

const CORES_CLARAS = Object.freeze({
    pendente: Object.freeze({
        conteudo: '#8A5D13',
        fundo: 'rgba(214, 140, 58, 0.14)',
        borda: 'rgba(138, 93, 19, 0.32)'
    }),
    ativo: Object.freeze({
        conteudo: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.14)',
        borda: 'rgba(44, 76, 59, 0.32)'
    }),
    inativo: Object.freeze({
        conteudo: '#5C5C59',
        fundo: 'rgba(92, 92, 89, 0.12)',
        borda: 'rgba(92, 92, 89, 0.28)'
    }),
    recusado: Object.freeze({
        conteudo: '#A13F2E',
        fundo: 'rgba(200, 90, 68, 0.14)',
        borda: 'rgba(161, 63, 46, 0.32)'
    })
});

const CORES_ESCURAS = Object.freeze({
    pendente: Object.freeze({
        conteudo: '#F2B45F',
        fundo: 'rgba(242, 180, 95, 0.16)',
        borda: 'rgba(242, 180, 95, 0.42)'
    }),
    ativo: Object.freeze({
        conteudo: '#9FD6B6',
        fundo: 'rgba(159, 214, 182, 0.14)',
        borda: 'rgba(159, 214, 182, 0.4)'
    }),
    inativo: Object.freeze({
        conteudo: '#C4C8C5',
        fundo: 'rgba(196, 200, 197, 0.12)',
        borda: 'rgba(196, 200, 197, 0.32)'
    }),
    recusado: Object.freeze({
        conteudo: '#F08A75',
        fundo: 'rgba(240, 138, 117, 0.14)',
        borda: 'rgba(240, 138, 117, 0.4)'
    })
});

function criarEstilos() {
    return StyleSheet.create({
        container: {
            minHeight: 24,
            maxWidth: '100%',
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            paddingVertical: 3,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderRadius: 999
        },

        containerCompacto: {
            minHeight: 20,
            gap: 4,
            paddingVertical: 2,
            paddingHorizontal: 8
        },

        indicador: {
            width: 6,
            height: 6,
            flexShrink: 0,
            borderRadius: 3
        },

        indicadorCompacto: {
            width: 5,
            height: 5,
            borderRadius: 2.5
        },

        texto: {
            flexShrink: 1,
            fontFamily: fontFamilies.semibold,
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 18,
            includeFontPadding: false
        },

        textoCompacto: {
            fontSize: 10,
            lineHeight: 14
        }
    });
}

function criarVariantes(tema) {
    const cores = tema.escuro ? CORES_ESCURAS : CORES_CLARAS;

    return Object.freeze(
        Object.fromEntries(
            Object.entries(cores).map(([estado, paleta]) => [
                estado,
                Object.freeze({
                    container: Object.freeze({
                        backgroundColor: paleta.fundo,
                        borderColor: paleta.borda
                    }),
                    indicador: Object.freeze({
                        backgroundColor: paleta.conteudo
                    }),
                    texto: Object.freeze({
                        color: paleta.conteudo
                    })
                })
            ])
        )
    );
}

export { CORES_CLARAS, CORES_ESCURAS, criarEstilos, criarVariantes };
