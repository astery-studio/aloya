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

        estadoCentral: {
            width: '100%',
            minHeight: 320,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 28,
            paddingVertical: 40
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
        }
    });
}

export { criarEstilos };
