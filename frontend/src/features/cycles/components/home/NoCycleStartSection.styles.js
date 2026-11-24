import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    cartao: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E7E1D7',
        borderRadius: 28,
        borderWidth: 0.7,
        marginHorizontal: 16,
        marginTop: 34,
        paddingHorizontal: 20,
        paddingVertical: 24,
        shadowColor: '#193D2E',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.16,
        shadowRadius: 36
    },
    rotulo: {
        color: '#5F5B54',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.9,
        lineHeight: 14,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 24,
        letterSpacing: -0.84,
        lineHeight: 36,
        paddingTop: 7
    },
    descricao: {
        color: '#66635E',
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 19,
        paddingBottom: 19,
        paddingTop: 9
    },
    observacao: {
        color: '#77736C',
        fontFamily: fontFamilies.regular,
        fontSize: 9,
        lineHeight: 13,
        paddingTop: 11,
        textAlign: 'center'
    },
    acoes: {
        flexDirection: 'row',
        gap: 8
    },
    acao: {
        flex: 1,
        height: 45
    }
});

export { estilos };
