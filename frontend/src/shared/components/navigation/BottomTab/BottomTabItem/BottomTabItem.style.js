import { StyleSheet } from 'react-native'
import { fontFamilies, tema } from '../../../../theme'

const corAtiva = tema.cores.marca.secundaria
const corInativa = tema.cores.neutras.textoSecundarioClaro

const estilos = StyleSheet.create({
    item: {
        flex: 1,
        minWidth: 0,
        height: 54,
        alignItems: 'center'
    },

    label: {
        marginTop: 4,
        color: corInativa,
        fontFamily: fontFamilies.medium,
        fontSize: 11,
        lineHeight: 16,
        textAlign: 'center',
        includeFontPadding: false
    },

    labelAtiva: {
        color: corAtiva,
        fontFamily: fontFamilies.medium
    },

    pontoAtivo: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginTop: 4,
        backgroundColor: corAtiva
    }
})

export { estilos, corAtiva, corInativa }
