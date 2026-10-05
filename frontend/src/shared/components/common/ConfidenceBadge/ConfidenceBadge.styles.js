import {StyleSheet} from 'react-native'
import {tema} from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        minHeight: 30,
        maxWidth: '100%',
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 7,
        paddingHorizontal: 8,
        borderRadius: tema.radius.switch
    },

    texto: {
        flexShrink: 1,
        color: tema.cores.neutras.superficieClara,
        fontFamily: tema.typography.micro.fontFamily,
        fontSize: tema.typography.micro.fontSize,
        fontStyle: tema.typography.micro.fontStyle,
        fontWeight: tema.typography.micro.fontWeight,
        lineHeight: tema.typography.micro.lineHeight,
        letterSpacing: tema.typography.micro.letterSpacing,
        includeFontPadding: false,
        textAlign: 'center'
    }
})

const variantes = Object.freeze({
    alta: Object.freeze({
        backgroundColor: tema.cores.marca.secundaria
    }),

    media: Object.freeze({
        backgroundColor: tema.cores.feedback.aviso
    }),

    baixa: Object.freeze({
        backgroundColor: tema.cores.marca.primaria
    })
})

export {estilos, variantes}