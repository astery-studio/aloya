// Define a estrutura visual da tela de convites recebidos.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        tela: {
            flex: 1,
            width: '100%',
            backgroundColor: tema.cores.interface.fundo
        },

        apresentacao: {
            width: '100%',
            maxWidth: 350.011,
            alignSelf: 'center',
            alignItems: 'center',
            gap: 18
        },

        descricao: {
            width: '100%',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 22.5,
            includeFontPadding: false
        },

        botaoLimpar: {
            width: '100%',
            maxWidth: 350.011,
            height: 35.99,
            borderWidth: 1,
            borderColor: '#C85A44',
            borderRadius: 10
        },

        textoBotaoLimpar: {
            color: '#C85A44',
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 25.5,
            textAlign: 'center'
        },

        lista: {
            flex: 1,
            width: '100%'
        }
    });
}

export { criarEstilos };
