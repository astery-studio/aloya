//Define a aparência fechada e expandida dos grupos de permissões.
import {StyleSheet} from 'react-native'
import {fontFamilies, tema} from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'stretch',
        overflow: 'hidden',
        backgroundColor: tema.cores.neutras.superficieClara,
        borderWidth: 1.41,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: 14
    },

    cabecalho: {
        width: '100%',
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        gap: 10,
        backgroundColor: tema.cores.neutras.superficieClara
    },

    areaExpansao: {
        flex: 1,
        minWidth: 0,
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },

    pressionado: {
        opacity: 0.72
    },

    caixaIcone: {
        width: 34,
        height: 34,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9
    },

    textos: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center'
    },

    titulo: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.semibold,
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 21,
        includeFontPadding: false
    },

    contagem: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 18,
        includeFontPadding: false
    },

    lista: {
        width: '100%',
        borderTopWidth: 0.7
    },

    item: {
        width: '100%'
    },

    itemComSeparador: {
        borderTopWidth: 0.7,
        borderTopColor: tema.cores.neutras.bordaClara
    }
})

export {estilos}