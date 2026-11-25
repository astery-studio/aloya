import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    cartao: {
        minHeight: 262.33,
        marginHorizontal: 16,
        paddingVertical: 23,
        paddingHorizontal: 18,
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E2D8',
        borderWidth: 0.666667,
        borderRadius: 28
    },
    rotulo: {
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        lineHeight: 14,
        letterSpacing: 0.9,
        includeFontPadding: false,
        textTransform: 'uppercase',
        color: '#5C5C59'
    },
    titulo: {
        marginTop: 5,
        fontFamily: fontFamilies.regular,
        fontSize: 23,
        lineHeight: 26,
        letterSpacing: -0.805,
        includeFontPadding: false,
        color: '#222222'
    },
    descricao: {
        marginTop: 8,
        fontFamily: fontFamilies.regular,
        fontSize: 11,
        lineHeight: 16,
        includeFontPadding: false,
        color: '#5C5C59'
    },
    acoes: { paddingTop: 16, gap: 8 },
    acao: {
        minHeight: 52,
        paddingVertical: 9,
        paddingHorizontal: 11,
        gap: 9,
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.78)'
    },
    iconeAcao: { width: 22, height: 22 },
    textoAcao: {
        fontFamily: fontFamilies.bold,
        fontSize: 10,
        lineHeight: 15,
        color: '#5C5C59'
    }
});

export { estilos };
