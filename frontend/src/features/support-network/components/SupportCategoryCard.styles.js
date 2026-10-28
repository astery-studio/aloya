//Define a apresentação dos cartões da lista de categorias de permissão.
import {StyleSheet} from 'react-native'

import {
    fontFamilies,
    tema
} from '../../../shared/theme'

const estilos = StyleSheet.create({
    cartao: {
        width: '100%',
        overflow: 'hidden',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
        gap: 14,
        backgroundColor:
            tema.cores.neutras.superficieClara,
        borderWidth: 1.5,
        borderColor:
            tema.cores.neutras.bordaClara,
        borderRadius: tema.radius.grande
    },

    cartaoDesabilitado: {
        opacity: 0.65
    },

    conteudoPrincipal: {
        width: '100%',
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },

    caixaIcone: {
        width: 40,
        height: 40,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:
            tema.cores.ciclo.superficieSuave,
        borderWidth: 1,
        borderColor:
            tema.cores.neutras.bordaClara,
        borderRadius: 12
    },

    confirmacaoIcone: {
        position: 'absolute',
        right: 5,
        bottom: 6,
        color: tema.cores.marca.secundaria,
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        lineHeight: 10
    },

    textos: {
        minWidth: 0,
        flex: 1,
        gap: 3
    },

    nome: {
        color:
            tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 24,
        includeFontPadding: false
    },

    resumo: {
        color:
            tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        includeFontPadding: false
    },

    acoes: {
        minWidth: 92,
        flexShrink: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4
    },

    divisor: {
        width: '100%',
        height: 1,
        backgroundColor:
            tema.cores.neutras.bordaClara
    },

    contatos: {
        minHeight: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9
    },

    textoContatos: {
        color:
            tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
        includeFontPadding: false
    },

    quantidadeContatos: {
        color:
            tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontWeight: '700'
    }
})

export {estilos}