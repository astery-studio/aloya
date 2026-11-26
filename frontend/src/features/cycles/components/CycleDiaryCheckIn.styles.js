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
        color: '#D68C3A',
        fontFamily: fontFamilies.bold,
        fontSize: 11,
        fontWeight: '700',
        includeFontPadding: false,
        letterSpacing: 0.88,
        lineHeight: 16,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 21,
        fontWeight: '400',
        includeFontPadding: false,
        letterSpacing: -0.525,
        lineHeight: 24,
        paddingTop: 4
    },
    descricao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        fontWeight: '400',
        includeFontPadding: false,
        lineHeight: 18,
        paddingTop: 7
    },
    conteudo: {
        gap: 14,
        paddingTop: 17
    },
    botao: {
        width: '100%',
        height: 36,
        minHeight: 36,
        maxHeight: 36,
        flexGrow: 0,
        alignSelf: 'stretch',
        paddingHorizontal: 14,
        paddingVertical: 0,
        borderRadius: 10
    },
    botaoDesativado: { backgroundColor: '#E6E2D8' },
    textoBotao: {
        fontFamily: fontFamilies.semibold,
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0,
        lineHeight: 20,
        includeFontPadding: false
    },
    textoBotaoDesativado: { color: '#A8A49C' }
});

export { estilos };
