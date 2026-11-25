import { StyleSheet } from 'react-native';

const estilos = StyleSheet.create({
    secao: { width: '100%', paddingTop: 38, paddingHorizontal: 16 },
    rolagem: { marginTop: 17 },
    seletor: { flexDirection: 'row', gap: 9, paddingTop: 2, paddingBottom: 8, paddingRight: 16 },
    fase: {
        width: 92,
        minWidth: 92,
        height: 88.33,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 7,
        paddingBottom: 10,
        paddingHorizontal: 6,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        borderRadius: 21
    },
    icone: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 17
    },
    artigo: {
        minHeight: 106.33,
        justifyContent: 'center',
        marginTop: 8,
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        borderRadius: 24
    },
    aviso: { marginTop: 8 }
});

export { estilos };
