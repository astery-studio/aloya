/**
 * Define a apresentação e o estado de foco do campo de data.
 */
import { StyleSheet } from 'react-native';
import { typography } from '../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        botao: {
            width: '100%',
            paddingTop: 8,
            alignItems: 'flex-start'
        },
        campo: {
            width: '100%',
            height: 56,
            borderRadius: tema.radius.buttonAndInput,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.borda,
            backgroundColor: tema.cores.interface.superficie,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
        },
        focado: {
            borderColor: tema.escuro ? tema.cores.interface.destaque : tema.cores.marca.primaria
        },
        entrada: {
            ...typography.bodyDefault,
            color: tema.cores.interface.textoPrincipal,
            padding: 0,
            minWidth: 112,
            textAlign: 'center'
        },
        desativado: { opacity: 0.55 }
    });
}

export { criarEstilos };
