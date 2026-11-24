import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    margem: {
        paddingHorizontal: 16,
        paddingTop: 34
    },
    cartao: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E2D8',
        borderRadius: 28,
        borderWidth: 0.666667,
        paddingHorizontal: 18,
        paddingVertical: 24
    },
    rotulo: {
        color: '#C85A44',
        fontFamily: fontFamilies.bold,
        fontSize: 11,
        letterSpacing: 0.88,
        lineHeight: 16,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 21,
        letterSpacing: -0.525,
        lineHeight: 24,
        paddingTop: 4
    },
    descricao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 18,
        paddingTop: 7
    },
    conteudo: {
        gap: 12,
        paddingTop: 17
    }
});

export { estilos };
