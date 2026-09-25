//Define a organização da seção que reúne todos os grupos de permissões.
import {StyleSheet} from 'react-native'
import {fontFamilies, tema} from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'stretch'
    },

    cabecalho: {
        width: '100%',
        minHeight: 42,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingBottom: 16
    },

    titulo: {
        flex: 1,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 26,
        includeFontPadding: false
    },

    lista: {
        width: '100%',
        gap: 10
    }
})

export {estilos}