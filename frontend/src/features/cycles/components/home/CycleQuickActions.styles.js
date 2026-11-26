import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const sombra = {
    boxShadow: '4px 4px 30px rgba(34, 34, 34, 0.1)'
};

const estilos = StyleSheet.create({
    secao: {
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 32
    },
    principal: {
        ...sombra,
        backgroundColor: '#C85A44',
        borderRadius: 12,
        height: 55,
        paddingHorizontal: 0
    },
    linha: {
        flexDirection: 'row',
        gap: 10,
        width: '100%'
    },
    secundaria: {
        ...sombra,
        backgroundColor: '#2C4C3B',
        borderRadius: 12,
        flex: 1,
        width: 'auto',
        height: 55,
        paddingHorizontal: 0
    },
    anticoncepcional: {
        flex: 0,
        width: '54.4%',
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        paddingHorizontal: 20
    },
    texto: {
        fontFamily: fontFamilies.semibold,
        fontSize: 15,
        fontWeight: '600',
        includeFontPadding: false,
        letterSpacing: 0,
        lineHeight: 22
    },
    textoPrincipal: { color: '#FDF6F3' }
});

export { estilos };
