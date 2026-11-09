//Define a organização do painel de permissões individuais.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        painel: {
            width: '100%',
            maxHeight: '94%'
        },

        corpo: {
            minHeight: 0,
            flexShrink: 1
        },

        rolagem: {
            minHeight: 0,
            flexShrink: 1
        },

        conteudoRolagem: {
            paddingTop: 14,
            paddingBottom: 24,
            gap: 24
        },

        separador: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },

        linha: {
            height: 1,
            flex: 1,
            backgroundColor: tema.cores.interface.separador
        },

        textoSeparador: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 0.4,
            textAlign: 'center',
            includeFontPadding: false
        },

        erro: {
            width: '100%',
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center'
        },

        acao: {
            width: '100%',
            paddingTop: 14,
            paddingBottom: 2,
            backgroundColor: tema.cores.interface.superficieElevada,
            borderTopWidth: 1,
            borderTopColor: tema.cores.interface.separador
        }
    });
}

export { criarEstilos };
