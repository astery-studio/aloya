import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../theme';

function criarEstilos(tema) {
    const corAtiva = tema.escuro ? '#A5D6A7' : tema.cores.interface.destaque;

    return StyleSheet.create({
        item: {
            flex: 1,
            maxWidth: 73.198,
            minWidth: 0,
            height: 53.5,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4
        },

        desabilitado: {
            opacity: 0.5
        },

        label: {
            color: tema.escuro ? '#999999' : tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18,
            textAlign: 'center',
            includeFontPadding: false
        },

        labelAtiva: {
            color: corAtiva,
            fontFamily: fontFamilies.medium
        }
    });
}

export { criarEstilos };
