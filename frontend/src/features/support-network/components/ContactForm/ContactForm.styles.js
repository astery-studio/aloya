//Define a organização visual do formulário de contato.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            gap: 28
        },

        permissoes: {
            width: '100%',
            gap: 10
        },

        tituloSecao: {
            marginBottom: 2,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 15,
            fontWeight: '500',
            lineHeight: 22,
            includeFontPadding: false
        },

        botaoPermissao: {
            width: '100%'
        },

        textoBotaoPermissao: {
            color: '#FFFFFF',
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: 21
        },

        erro: {
            width: '100%',
            marginTop: -18,
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 19,
            includeFontPadding: false
        },

        erroEmail: {
            width: '100%',
            alignSelf: 'stretch',
            color: '#C85A44',
            textAlign: 'left'
        },

        acao: {
            width: '100%',
            paddingTop: 18
        }
    });
}

export { criarEstilos };
