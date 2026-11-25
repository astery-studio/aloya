import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    cartao: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E2D8',
        borderRadius: 28,
        borderWidth: 0.7,
        marginHorizontal: 16,
        marginTop: 34,
        paddingHorizontal: 20,
        paddingVertical: 24,
        boxShadow: '0px 18px 36px rgba(44, 76, 59, 0.16)'
    },
    primeiroPasso: { minHeight: 292.4 },
    seuEspaco: { minHeight: 235.4 },
    rotulo: {
        color: '#5C5C59',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        fontWeight: '700',
        includeFontPadding: false,
        letterSpacing: 0.9,
        lineHeight: 14,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 24,
        includeFontPadding: false,
        letterSpacing: -0.84,
        lineHeight: 36,
        paddingTop: 7
    },
    descricao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        includeFontPadding: false,
        lineHeight: 19,
        paddingBottom: 19,
        paddingTop: 9
    },
    observacao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 9,
        includeFontPadding: false,
        lineHeight: 13,
        paddingTop: 11,
        textAlign: 'center'
    },
    acoes: {
        flexDirection: 'row',
        gap: 10
    },
    acaoPrincipal: {
        backgroundColor: '#C85A44',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)',
        borderRadius: 12,
        height: 45,
        paddingHorizontal: 0
    },
    acao: {
        backgroundColor: '#2C4C3B',
        boxShadow: '4px 4px 30px rgba(34, 34, 34, 0.1)',
        borderRadius: 12,
        flex: 1,
        width: 'auto',
        height: 45,
        paddingHorizontal: 0
    },
    acaoAnticoncepcional: {
        flex: 0,
        width: '55%',
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        paddingHorizontal: 20
    },
    textoAcao: {
        fontFamily: fontFamilies.semibold,
        fontSize: 15,
        fontWeight: '600',
        includeFontPadding: false,
        letterSpacing: 0,
        lineHeight: 22
    },
    textoAcaoPrincipal: {
        color: '#FDF6F3',
        fontFamily: fontFamilies.bold,
        fontWeight: '700'
    }
});

export { estilos };
