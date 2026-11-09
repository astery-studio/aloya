import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        modal: {
            maxWidth: 390
        },

        conteudo: {
            width: '100%',
            gap: 20
        },

        secao: {
            width: '100%',
            alignItems: 'center',
            gap: 10
        },

        tituloSecao: {
            width: '100%',
            color: tema.escuro ? '#F08A75' : tema.cores.marca.primaria,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 0.6,
            textAlign: 'center',
            includeFontPadding: false
        },

        descricao: {
            width: '100%',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center',
            includeFontPadding: false
        },

        mensagemVazia: {
            width: '100%',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center',
            includeFontPadding: false
        },

        lista: {
            width: '100%',
            gap: 9
        },

        item: {
            width: '100%',
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10
        },

        marcador: {
            width: 7,
            height: 7,
            flexShrink: 0,
            marginTop: 7,
            borderRadius: 3.5,
            backgroundColor: tema.escuro ? '#F08A75' : tema.cores.marca.primaria
        },

        textoItem: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 20,
            includeFontPadding: false
        },

        textoItemDestaque: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.semibold,
            fontWeight: '600'
        },

        vinculo: {
            width: '100%',
            alignItems: 'center'
        },

        botao: {
            width: '100%'
        }
    });
}

export { criarEstilos };
