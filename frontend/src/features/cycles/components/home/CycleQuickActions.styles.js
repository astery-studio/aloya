import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const sombra = {
    shadowColor: '#222222',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 30
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
        height: 55,
        paddingHorizontal: 0
    },
    anticoncepcional: {
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        paddingHorizontal: 20
    },
    texto: {
        fontFamily: fontFamilies.semibold,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0,
        lineHeight: 22
    }
});

export { estilos };
