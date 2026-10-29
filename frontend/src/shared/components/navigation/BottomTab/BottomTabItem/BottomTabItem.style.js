import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../theme';

function criarEstilos(tema) {
    const corAtiva = tema.cores.marca.secundaria;

    return StyleSheet.create({
        item: {
            flex: 1,
            minWidth: 0,
            height: '100%',
            alignItems: 'center',
            paddingTop: 14
        },

        desabilitado: {
            opacity: 0.5
        },

        label: {
            marginTop: 4,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18,
            textAlign: 'center',
            includeFontPadding: false
        },

        labelAtiva: {
            color: corAtiva,
            fontFamily: fontFamilies.medium
        },

        pontoAtivo: {
            width: 5,
            height: 5,
            borderRadius: 3,
            marginTop: 5,
            backgroundColor: corAtiva
        }
    });
}

export { criarEstilos };
