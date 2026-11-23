import { StyleSheet } from 'react-native';

const estilos = StyleSheet.create({
    cartao: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E7E1D7',
        borderRadius: 20,
        borderWidth: 1,
        gap: 10,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 18,
        shadowColor: '#193D2E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12
    },
    rotulo: {
        color: '#5F5B54',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontSize: 20,
        lineHeight: 26
    },
    descricao: {
        color: '#66635E',
        fontSize: 13,
        lineHeight: 19
    },
    observacao: {
        color: '#77736C',
        fontSize: 10,
        lineHeight: 14,
        textAlign: 'center'
    },
    acoes: {
        flexDirection: 'row',
        gap: 8
    },
    acao: {
        flex: 1,
        minHeight: 48
    }
});

export { estilos };
