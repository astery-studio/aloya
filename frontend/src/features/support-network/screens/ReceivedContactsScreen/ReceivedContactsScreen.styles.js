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
            paddingBottom: 18
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
