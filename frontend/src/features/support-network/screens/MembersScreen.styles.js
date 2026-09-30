import {StyleSheet} from 'react-native'
import {fontFamilies, tema} from '../../../shared/theme'

const estilos = StyleSheet.create({
    conteudo: {
        flexGrow: 1,
        gap: tema.espacamentos.extraGrande,
        paddingHorizontal: tema.espacamentos.grande,
        paddingTop: tema.espacamentos.grande,
        paddingBottom: tema.espacamentos.extraGrande
    },

    apresentacao: {
        width: '100%',
        gap: tema.espacamentos.pequeno
    },

    titulo: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 22,
        lineHeight: 29,
        includeFontPadding: false
    },

    descricao: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        includeFontPadding: false
    }
})

export {estilos}
