import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const textos = StyleSheet.create({
    previsao: {
        color: '#C85A44',
        fontFamily: fontFamilies.bold,
        fontSize: 11,
        lineHeight: 16,
        letterSpacing: 0.88,
        textTransform: 'uppercase'
    },
    titulo: {
        marginTop: 4,
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 21,
        lineHeight: 24,
        letterSpacing: -0.525
    },
    dia: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 50,
        lineHeight: 50,
        letterSpacing: -3
    },
    mes: { color: '#222222', fontFamily: fontFamilies.bold, fontSize: 14, lineHeight: 21 },
    estimativa: {
        marginTop: 3,
        color: '#2C4C3B',
        fontFamily: fontFamilies.medium,
        fontSize: 9,
        lineHeight: 14,
        textTransform: 'uppercase'
    },
    rotulo: { color: '#2C4C3B', fontFamily: fontFamilies.medium, fontSize: 9, lineHeight: 14 },
    valor: {
        marginTop: 2,
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 11,
        lineHeight: 16
    },
    incerta: { color: '#A8671E', fontFamily: fontFamilies.medium, fontSize: 10, lineHeight: 14 }
});

export { textos };
