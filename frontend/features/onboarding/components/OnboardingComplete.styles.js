import { StyleSheet } from 'react-native';
import { cores, fontFamilies, typography } from '../../../theme';

const estilos = StyleSheet.create({
    conteudo: { alignItems: 'center', gap: 40, width: '100%' },
    titulo: {
        ...typography.h1,
        color: cores.neutras.textoPrincipalClaro,
        maxWidth: 342,
        textAlign: 'center'
    },
    marca: {
        color: cores.marca.primaria,
        fontFamily: fontFamilies.bold,
        fontWeight: '900'
    },
    logo: {
        alignItems: 'center',
        height: 80,
        justifyContent: 'center',
        width: 220
    }
});

export { estilos };
