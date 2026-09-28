import { StyleSheet } from 'react-native'
import { fontFamilies, tema } from '../../../../theme'

const corAtiva = tema.cores.marca.secundaria
const corInativa = tema.cores.neutras.textoSecundarioClaro

const estilos = StyleSheet.create({
    item: {
        flex: 1,
        minWidth: 0,
        height: '100%',
        alignItems: 'center',
        paddingTop: 14
    },

    label: {
        marginTop: 4,
        color: corInativa,
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 18,
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
        marginTop: 5,
        backgroundColor: corAtiva
    }
})

export { estilos, corAtiva, corInativa }