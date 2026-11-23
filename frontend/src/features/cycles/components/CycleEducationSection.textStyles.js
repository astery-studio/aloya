import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

const textos = StyleSheet.create({
    etiqueta: {
        color: '#5C5C59',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        lineHeight: 14,
        letterSpacing: 0.9,
        textTransform: 'uppercase'
    },
    titulo: {
        marginTop: 5,
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 23,
        lineHeight: 26,
        letterSpacing: -0.805
    },
    introducao: {
        marginTop: 8,
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 11,
        lineHeight: 16
    },
    nomeFase: { marginTop: 7, fontFamily: fontFamilies.bold, fontSize: 10, lineHeight: 15 },
    visao: {
        fontFamily: fontFamilies.bold,
        fontSize: 8,
        lineHeight: 12,
        letterSpacing: 0.64,
        textTransform: 'uppercase'
    },
    tituloArtigo: {
        marginTop: 4,
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 15,
        lineHeight: 22
    },
    descricao: {
        marginTop: 6,
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 10,
        lineHeight: 15
    }
});

export { textos };
