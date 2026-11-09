import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            borderRadius: tema.radius.buttonAndInput,
            backgroundColor: tema.cores.interface.superficie
        },
        grupo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
        },
        entrada: {
            minWidth: 24,
            padding: 0,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 24,
            textAlign: 'center'
        },
        unidade: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 20
        },
        desabilitado: { opacity: 0.55 },
        erro: {
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18
        }
    });
}

export { criarEstilos };
