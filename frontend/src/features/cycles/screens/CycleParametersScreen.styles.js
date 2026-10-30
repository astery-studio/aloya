import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        estado: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: tema.espacamentos.medio
        },
        tituloErro: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 20,
            lineHeight: 30
        },
        textoEstado: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        }
    });
}

export { criarEstilos };
