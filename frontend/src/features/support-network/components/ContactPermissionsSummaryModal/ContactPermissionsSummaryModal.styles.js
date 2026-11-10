import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        modal: {
            width: '100%',
            maxWidth: 342,
            borderRadius: 20,
            boxShadow: '0 8px 40px 0 rgba(34, 34, 34, 0.12)'
        },

        conteudo: {
            width: '100%',
            alignItems: 'center',
            gap: 12
        },

        secao: {
            width: '100%',
            alignItems: 'center',
            gap: 8
        },

        tituloSecao: {
            width: '100%',
            color: tema.escuro ? '#F08A75' : tema.cores.marca.primaria,
            fontFamily: fontFamilies.bold,
            fontSize: 10,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 0.6,
            textAlign: 'center',
            includeFontPadding: false
        },

        descricao: {
            width: 294,
            maxWidth: '100%',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center',
            includeFontPadding: false
        },

        mensagemVazia: {
            width: 294,
            maxWidth: '100%',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center',
            includeFontPadding: false
        },

        lista: {
            width: 294,
            maxWidth: '100%',
            paddingVertical: 8,
            paddingHorizontal: 5,
            alignItems: 'center',
            gap: 5
        },

        item: {
            width: '100%',
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },

        marcador: {
            width: 9,
            flexShrink: 0,
            color: tema.escuro ? '#F08A75' : '#C85A44',
            fontFamily: fontFamilies.regular,
            fontSize: 9,
            fontWeight: '400',
            lineHeight: 13.5
        },

        marcadorAlternado: {
            color: tema.escuro ? '#9FD6B6' : '#2C4C3B'
        },

        textoItem: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 11,
            fontWeight: '400',
            lineHeight: 16.5,
            includeFontPadding: false
        },

        textoItemDestaque: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontWeight: '700'
        },

        textoItemComplemento: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontWeight: '400'
        },

        vinculo: {
            width: '100%',
            paddingTop: 8,
            alignItems: 'center'
        },

        botao: {
            width: '100%',
            backgroundColor: '#C85A44'
        },

        textoBotao: {
            color: '#FFFFFF'
        }
    });
}

export { criarEstilos };
