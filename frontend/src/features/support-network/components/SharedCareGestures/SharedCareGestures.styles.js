import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    secao: {
        width: '100%',
        maxWidth: 358,
        minHeight: 318,
        alignSelf: 'center',
        alignItems: 'flex-start',
        paddingTop: 34
    },
    rotulo: {
        color: '#D68C3A',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        lineHeight: 13.5,
        letterSpacing: 0.81,
        textTransform: 'uppercase',
        includeFontPadding: false
    },
    titulo: {
        alignSelf: 'stretch',
        minHeight: 32,
        paddingTop: 5,
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 23,
        lineHeight: 26.45,
        letterSpacing: -0.69,
        includeFontPadding: false
    },
    grade: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingTop: 17
    },
    opcao: {
        flexGrow: 1,
        flexBasis: '45%',
        minHeight: 106,
        padding: 13,
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderWidth: 0.667,
        borderColor: '#E6E2D8',
        borderRadius: 22
    },
    caixaIcone: {
        width: 39,
        height: 39,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        backgroundColor: '#FDF0EC'
    },
    textoOpcao: {
        paddingTop: 10,
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 12,
        lineHeight: 18,
        includeFontPadding: false
    }
});

export { estilos };
