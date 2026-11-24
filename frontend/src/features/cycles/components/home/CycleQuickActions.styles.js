import { StyleSheet } from 'react-native';

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
        height: 55
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
        height: 55
    }
});

export { estilos };
