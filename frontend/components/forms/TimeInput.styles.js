import { StyleSheet } from 'react-native';
import { cores, radius, typography } from '../../theme';

const estilos = StyleSheet.create({
    linha: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 },
    campo: {
        flex: 1, minHeight: 56, borderRadius: radius.buttonAndInput,
        borderWidth: 0.705, borderColor: cores.neutras.bordaClara,
        backgroundColor: cores.neutras.superficieClara,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingLeft: 15, paddingRight: 16
    },
    entrada: {
        ...typography.bodyDefault, color: cores.neutras.textoPrincipalClaro,
        flex: 1, padding: 0
    },
    remover: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    pressionado: { opacity: 0.65, transform: [{ scale: 0.98 }] },
    desativado: { opacity: 0.55 }
});

export { estilos };
