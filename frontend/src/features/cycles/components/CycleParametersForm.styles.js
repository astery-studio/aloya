import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            gap: tema.espacamentos.grande,
            paddingTop: tema.espacamentos.grande
        },
        titulo: {
            paddingLeft: 4,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            lineHeight: 21
        },
        campos: {
            gap: tema.espacamentos.pequeno
        }
    });
}

export { criarEstilos };
