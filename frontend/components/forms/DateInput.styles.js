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
    texto: { ...typography.bodyDefault, color: cores.neutras.textoSecundarioClaro },
    textoPreenchido: { color: cores.neutras.textoPrincipalClaro },
    pressionado: { opacity: 0.65, transform: [{ scale: 0.98 }] },
    desativado: { opacity: 0.55 }
});

export { estilos };
