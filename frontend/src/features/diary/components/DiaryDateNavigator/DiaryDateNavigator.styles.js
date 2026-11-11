import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            minHeight: 54,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 8
        },
        botaoSeta: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center'
        },
        data: {
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            paddingHorizontal: 8
        },
        texto: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 17,
            lineHeight: 26,
            textAlign: 'center'
        },
        desabilitado: { opacity: 0.4 }
    });
}

export { criarEstilos };
