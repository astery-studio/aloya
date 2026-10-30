import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            gap: tema.espacamentos.grande
        },

        secao: {
            width: '100%',
            gap: tema.espacamentos.pequeno
        },

        tituloSecao: {
            marginLeft: 4,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: 21
        },

        campos: {
            width: '100%',
            gap: tema.espacamentos.pequeno
        }
    });
}

export { criarEstilos };
