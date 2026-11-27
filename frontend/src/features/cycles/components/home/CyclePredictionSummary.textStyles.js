import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const textos = StyleSheet.create({
    previsao: {
        color: '#C85A44',
        fontFamily: fontFamilies.bold,
        fontSize: 11,
        includeFontPadding: false,
        lineHeight: 16,
        letterSpacing: 0.88,
        textTransform: 'uppercase'
    },
    titulo: {
        marginTop: 4,
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 21,
        includeFontPadding: false,
        lineHeight: 24,
        letterSpacing: -0.525
    },
    dia: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 50,
        includeFontPadding: false,
        lineHeight: 50,
        letterSpacing: -3
    },
    mes: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 14,
        includeFontPadding: false,
        lineHeight: 21
    },
    estimativa: {
        marginTop: 3,
        color: '#2C4C3B',
        fontFamily: fontFamilies.medium,
        fontSize: 9,
        includeFontPadding: false,
        lineHeight: 14,
        textTransform: 'uppercase'
    },
    rotulo: {
        color: '#2C4C3B',
        fontFamily: fontFamilies.medium,
        fontSize: 9,
        includeFontPadding: false,
        lineHeight: 14
    },
    valor: {
        marginTop: 2,
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 11,
        includeFontPadding: false,
        lineHeight: 16
    }
});

export { textos };
