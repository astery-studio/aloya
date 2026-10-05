//Define o visual da tela provisória usada para testar todas as variantes do ConfidenceBadge.
import {StyleSheet} from 'react-native'

import {fontFamilies, tema} from '../../../shared/theme'

const estilos = StyleSheet.create({
    conteudo: {
        flexGrow: 1,
        gap: tema.espacamentos.grande,
        paddingHorizontal: tema.espacamentos.grande,
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
    },

    lista: {
        width: '100%',
        gap: 12
    },

    item: {
        width: '100%',
        minHeight: 104,
        flexDirection: 'row',
        alignItems: 'center',
        gap: tema.espacamentos.medio,
        padding: 12,
        backgroundColor: tema.cores.neutras.superficieClara,
        borderWidth: 0.7,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: tema.radius.buttonAndInput
    },

    amostra: {
        width: 160,
        minHeight: 80,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tema.cores.neutras.fundoClaro,
        borderRadius: tema.radius.buttonAndInput
    },

    nome: {
        flex: 1,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.medium,
        fontSize: 16,
        lineHeight: 24,
        includeFontPadding: false
    }
})

export {estilos}