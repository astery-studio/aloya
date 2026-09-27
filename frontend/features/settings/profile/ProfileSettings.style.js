import { StyleSheet } from 'react-native'
import { fontFamilies, tema } from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        gap: tema.espacamentos.grande
    },

    secao: {
        width: '100%',
        gap: tema.espacamentos.pequeno
    },

    tituloSecao: {
        marginLeft: 4,
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 21
    },

    campos: {
        width: '100%',
        gap: tema.espacamentos.pequeno
    }
})

export { estilos }