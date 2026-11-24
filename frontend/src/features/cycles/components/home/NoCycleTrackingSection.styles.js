import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    secao: {
        paddingHorizontal: 16,
        paddingTop: 38
    },
    rotulo: {
        color: '#5C5C59',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        letterSpacing: 0.9,
        lineHeight: 14,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 23,
        letterSpacing: -0.805,
        lineHeight: 26,
        paddingTop: 5
    },
    cartoes: {
        gap: 10,
        paddingTop: 17
    },
    icone: {
        borderRadius: 12,
        padding: 10
    }
});

export { estilos };
