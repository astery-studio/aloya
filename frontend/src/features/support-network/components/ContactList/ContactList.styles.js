import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        conteudoLista: {
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 28
        },

        separador: {
            height: 14
        },

        estadoComCabecalho: {
            width: '100%',
            flex: 1,
            minHeight: 0,
            paddingHorizontal: 20,
            paddingTop: 18
        },

        estadoCentral: {
            width: '100%',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 76
        },

        botaoEstado: {
            width: '100%',
            height: 56,
            borderRadius: 12
        },

        textoBotaoEstado: {
            fontFamily: fontFamilies.semibold,
            fontSize: 17,
            fontWeight: '600',
            lineHeight: 24
        },

        textoDestaque: {
            fontFamily: fontFamilies.bold,
            fontWeight: '700'
        },

        textoCarregamento: {
            marginTop: 14,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 22,
            includeFontPadding: false
        },

        atualizacao: {
            minHeight: 38,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingBottom: 12
        },

        textoAtualizacao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 20,
            includeFontPadding: false
        },

        cabecalhoGrupo: {
            width: '100%',
            minHeight: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },

        linhaGrupo: {
            minWidth: 16,
            height: 1,
            flex: 1,
            backgroundColor: tema.cores.interface.separador
        },

        tituloGrupo: {
            flexShrink: 1,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 0.7,
            textAlign: 'center',
            includeFontPadding: false
        },

        resultadoFiltroVazio: {
            width: '100%',
            alignItems: 'center'
        },

        mensagemFiltroVazio: {
            width: '100%',
            paddingTop: 18,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 22.5,
            textAlign: 'left',
            includeFontPadding: false
        }
    });
}

export { criarEstilos };
