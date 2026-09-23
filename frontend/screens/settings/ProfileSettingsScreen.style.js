import { StyleSheet } from 'react-native'
import { fontFamilies, tema } from '../../theme'

const estilos = StyleSheet.create({
    estadoTela: {
        flex: 1,
        minHeight: 320,
        alignItems: 'center',
        justifyContent: 'center',
        gap: tema.espacamentos.medio
    },

    textoEstado: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center'
    },

    erroEstado: {
        color: tema.cores.feedback.erro,
        fontFamily: fontFamilies.medium,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center'
    },

    rodape: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tema.espacamentos.extraGrande
    },

    separadorRodape: {
        width: 1,
        height: 16,
        backgroundColor: tema.cores.neutras.bordaClara
    },

    acaoPerigo: {
        color: tema.cores.feedback.erro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textDecorationLine: 'underline'
    },

    acaoNormal: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textDecorationLine: 'underline'
    },

    acaoPressionada: {
        opacity: 0.6
    },

    acaoDesabilitada: {
        opacity: 0.4
    }
})

export { estilos }