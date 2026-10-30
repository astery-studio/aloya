import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            paddingHorizontal: 14,
            paddingTop: 20,
            paddingBottom: 16,
            borderWidth: 1.4,
            borderColor: tema.cores.interface.borda,
            borderRadius: tema.radius.buttonAndInput,
            backgroundColor: tema.cores.interface.superficie,
            gap: 16
        },

        nome: {
            alignSelf: 'center',
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 17,
            fontWeight: '700',
            lineHeight: 24,
            textAlign: 'center'
        },

        opcoes: {
            width: '100%',
            gap: 10
        }
    });
}

export { criarEstilos };
