import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        estado: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: 24
        },
        textoEstado: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            lineHeight: 22.5,
            textAlign: 'center'
        },
        destaque: {
            fontFamily: fontFamilies.bold,
            fontWeight: '700'
        }
    });
}

export { criarEstilos };
