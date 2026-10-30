/**
 * Define a disposição e os estados visuais do campo de horário.
 */
import { StyleSheet } from 'react-native';
import { typography } from '../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        linha: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 },
        campo: {
            flex: 1,
            minHeight: 48,
            borderRadius: tema.radius.buttonAndInput,
            borderWidth: 0.705,
            borderColor: tema.cores.interface.borda,
            backgroundColor: tema.cores.interface.superficie,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingLeft: 15,
            paddingRight: 16
        },
        entrada: {
            ...typography.bodyDefault,
            color: tema.cores.interface.textoPrincipal,
            flex: 1,
            padding: 0
        },
        remover: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10
        },
        pressionado: { opacity: 0.65, transform: [{ scale: 0.98 }] },
        desativado: { opacity: 0.55 }
    });
}

export { criarEstilos };
