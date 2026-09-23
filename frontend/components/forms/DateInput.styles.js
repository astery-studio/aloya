import { StyleSheet } from 'react-native';
import { cores, radius, typography } from '../../theme';

const estilos = StyleSheet.create({
    campo: {
        width: '100%', height: 56, borderRadius: radius.buttonAndInput,
        borderWidth: 1.41, borderColor: cores.neutras.bordaClara,
        backgroundColor: cores.neutras.superficieClara,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10
    },
    preenchido: {
        borderColor: cores.marca.primaria,
        boxShadow: '0 0 0 3px rgba(200, 90, 68, 0.10)'
    },
    entrada: {
        ...typography.bodyDefault, color: cores.neutras.textoPrincipalClaro,
        padding: 0, minWidth: 112, textAlign: 'center'
    },
    desativado: { opacity: 0.55 }
});

export { estilos };
