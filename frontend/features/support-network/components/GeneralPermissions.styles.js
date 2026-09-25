//Define a organização visual da seção de permissões gerais.
import {StyleSheet} from 'react-native'
import {fontFamilies, tema} from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'stretch'
    },

    titulo: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 26,
        includeFontPadding: false,
        marginBottom: 16
    },

    lista: {
        width: '100%',
        gap: 10
    }
})

export {estilos}