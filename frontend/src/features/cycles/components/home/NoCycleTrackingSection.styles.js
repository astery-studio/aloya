import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    secao: {
        paddingHorizontal: 16
    },
    rotulo: {
        color: '#5C5C59',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        includeFontPadding: false,
        letterSpacing: 0.9,
        lineHeight: 14,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 23,
        includeFontPadding: false,
        letterSpacing: -0.805,
        lineHeight: 26,
        paddingTop: 5
    },
    cartoes: {
        gap: 10,
        paddingTop: 17
    },
    icone: {
        width: 45,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15
    },
    descricao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 10,
        lineHeight: 15,
        includeFontPadding: false
    },
    acao: {
        marginTop: 12,
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 10
    },
    textoAcao: {
        fontFamily: fontFamilies.regular,
        fontWeight: '400',
        fontSize: 13,
        letterSpacing: 0,
        lineHeight: 20,
        includeFontPadding: false
    }
});

export { estilos };
