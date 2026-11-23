import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        chip: {
            minHeight: 38,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: tema.cores.marca.primaria,
            borderRadius: 999,
            backgroundColor: tema.cores.interface.fundo
        },
        texto: {
            color: tema.cores.marca.primaria,
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            lineHeight: 19
        },
        pressionado: { opacity: 0.72 }
    });
}

export { criarEstilos };
