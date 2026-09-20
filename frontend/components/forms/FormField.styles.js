import { StyleSheet } from 'react-native';
import { cores, typography } from '../../theme';

const estilos = StyleSheet.create({
    container: { width: '100%', gap: 8 },
    label: {
        ...typography.caption,
        color: cores.neutras.textoSecundarioClaro
    },
    mensagemAuxiliar: {
        ...typography.caption,
        color: cores.neutras.textoSecundarioClaro
    }
});

export { estilos };
