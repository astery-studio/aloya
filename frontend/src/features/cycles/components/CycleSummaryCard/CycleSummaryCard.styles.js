//Preserva as medidas do protótipo sem impedir que o card se adapte a telas estreitas.
import {StyleSheet} from 'react-native'

import {fontFamilies, tema} from '../../../../shared/theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 350,
        alignSelf: 'center',
        overflow: 'hidden',
        backgroundColor: tema.cores.neutras.superficieClara,
        borderWidth: 1.41,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: 16
    },

    comMetricas: {
        height: 210.4
    },

    semMetricas: {
        height: 100
    },

    cabecalho: {
        width: '100%',
        height: 50.82,
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderBottomWidth: 1.41,
        borderBottomColor: tema.cores.neutras.bordaClara
    },

    cabecalhoCentralizado: {
        alignItems: 'center'
    },

    cabecalhoAlinhado: {
        alignItems: 'flex-start'
    },

    titulo: {
        maxWidth: '100%',
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 18,
        letterSpacing: 0.5,
        includeFontPadding: false
    },

    metricas: {
        width: '100%',
        height: 103.6,
        flexDirection: 'row',
        borderBottomWidth: 1.41,
        borderBottomColor: tema.cores.neutras.bordaClara
    },

    metrica: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
        paddingHorizontal: 20
    },

    metricaComSeparador: {
        borderRightWidth: 0.99,
        borderRightColor: tema.cores.neutras.bordaClara
    },

    rotuloMetrica: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 19.5,
        includeFontPadding: false
    },

    valorDaMetrica: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8
    },

    numero: {
        flexShrink: 1,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 40,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 48,
        includeFontPadding: false
    },

    dias: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 15,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 22.5,
        includeFontPadding: false
    },

    rodape: {
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        paddingTop: 12,
        paddingRight: 20,
        paddingBottom: 14,
        paddingLeft: 20
    },

    quantidade: {
        flexShrink: 1,
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 19.5,
        includeFontPadding: false
    },

    caixaDaTag: {
        flexShrink: 0,
        alignSelf: 'center',
        justifyContent: 'center'
    }
})

export {estilos}