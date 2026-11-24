import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    lista: {
        gap: 12
    },
    grupo: {
        width: 294,
        maxWidth: '100%',
        alignSelf: 'center',
        gap: 10
    },
    cabecalho: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center'
    },
    divisor: {
        backgroundColor: '#E6E2D8',
        flex: 1,
        height: 0.666667
    },
    titulo: {
        color: '#5C5C59',
        fontFamily: fontFamilies.bold,
        fontSize: 10,
        fontWeight: '700',
        includeFontPadding: false,
        letterSpacing: 0.55,
        lineHeight: 15,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    opcoes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center'
    },
    textoOpcao: {
        fontFamily: fontFamilies.semibold,
        fontSize: 11,
        fontWeight: '600',
        includeFontPadding: false,
        lineHeight: 16
    }
});

export { estilos };
