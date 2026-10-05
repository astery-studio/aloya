//Define as medidas, tipografia e cores das versões completa e compacta da confiabilidade.
import {StyleSheet} from 'react-native'

import {fontFamilies, tema} from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
        flexShrink: 0
    },

    completo: {
        width: 140.33,
        height: 59.33,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 0.666667,
        borderRadius: 16
    },

    compacto: {
        height: 24,
        maxWidth: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderWidth: 0,
        borderRadius: tema.radius.switch
    },

    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },

    rotulo: {
        flexShrink: 1,
        fontFamily: fontFamilies.medium,
        fontSize: 11,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 16,
        letterSpacing: 0.45,
        includeFontPadding: false
    },

    nivel: {
        flexShrink: 1,
        fontFamily: fontFamilies.semibold,
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 20,
        includeFontPadding: false
    },

    ponto: {
        width: 5.99,
        height: 5.99,
        flexShrink: 0,
        borderRadius: 2.99578
    },

    textoCompacto: {
        flexShrink: 1,
        fontFamily: fontFamilies.semibold,
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 18,
        includeFontPadding: false
    }
})

const variantes = Object.freeze({
    alta: Object.freeze({
        cor: tema.cores.marca.secundaria,
        fundo: 'rgba(44, 76, 59, 0.14)',
        borda: 'rgba(44, 76, 59, 0.333)'
    }),

    media: Object.freeze({
        cor: tema.cores.feedback.aviso,
        fundo: 'rgba(214, 140, 58, 0.14)',
        borda: 'rgba(214, 140, 58, 0.333)'
    }),

    baixa: Object.freeze({
        cor: tema.cores.marca.primaria,
        fundo: 'rgba(200, 90, 68, 0.14)',
        borda: 'rgba(200, 90, 68, 0.333)'
    })
})

export {estilos, variantes}