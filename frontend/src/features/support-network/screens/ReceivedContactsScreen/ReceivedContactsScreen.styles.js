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
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 14
        },

        descricao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            lineHeight: 24,
            includeFontPadding: false
        },

        lista: {
            flex: 1,
            width: '100%'
        }
    });
}

export { criarEstilos };
