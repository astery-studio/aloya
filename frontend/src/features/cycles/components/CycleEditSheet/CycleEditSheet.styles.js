import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        formulario: {
            gap: 16,
            paddingTop: 12,
            paddingBottom: 40
        },
        campo: {
            gap: 8
        },
        label: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            lineHeight: 21
        },
        ajuda: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18,
            textAlign: 'center'
        },
        limpar: {
            minHeight: 36,
            alignItems: 'center',
            justifyContent: 'center'
        },
        textoLimpar: {
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.medium,
            fontSize: 13,
            lineHeight: 18
        }
    });
}

export { criarEstilos };
