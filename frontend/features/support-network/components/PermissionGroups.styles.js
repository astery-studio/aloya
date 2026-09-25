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

    contador: {
        minWidth: 85,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: tema.cores.icones.anticoncepcionais.verde.caixa,
        borderRadius: 999
    },

    textoContador: {
        color: tema.cores.icones.anticoncepcionais.verde.icone,
        fontFamily: fontFamilies.semibold,
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
        includeFontPadding: false
    },

    lista: {
        width: '100%',
        gap: 10
    }
})

export {estilos}