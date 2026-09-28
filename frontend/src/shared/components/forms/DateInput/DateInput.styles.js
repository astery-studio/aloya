/**
 * Define a apresentação e o estado de foco do campo de data.
 */
import { StyleSheet } from 'react-native';
import { cores, radius, typography } from '../../../theme';

const estilos = StyleSheet.create({
    botao: {
        width: '100%',
        paddingTop: 8,
        alignItems: 'flex-start'
    },
    campo: {
        width: '100%', height: 56, borderRadius: radius.buttonAndInput,
        borderWidth: 1.41, borderColor: cores.neutras.bordaClara,
        backgroundColor: cores.neutras.superficieClara,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10
    },
    focado: {
        borderColor: cores.marca.primaria
    },
    entrada: {
        ...typography.bodyDefault, color: cores.neutras.textoPrincipalClaro,
        padding: 0, minWidth: 112, textAlign: 'center'
    },
    desativado: { opacity: 0.55 }
});

export { estilos };
