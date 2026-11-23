import { StyleSheet } from 'react-native';

const estilos = StyleSheet.create({
    margem: { width: '100%', paddingTop: 32, paddingHorizontal: 16 },
    card: {
        width: '100%',
        maxWidth: 358,
        alignSelf: 'center',
        paddingVertical: 21,
        paddingHorizontal: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.7,
        borderColor: '#E6E2D8',
        borderRadius: 28,
        shadowColor: '#2C4C3B',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 18,
        elevation: 8
    },
    cabecalho: {
        height: 46,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12
    },
    metricas: { minHeight: 75, flexDirection: 'row', marginTop: 20 },
    data: { width: 138, flexDirection: 'row', alignItems: 'center', gap: 9 },
    secundarias: {
        flex: 1,
        justifyContent: 'center',
        gap: 11,
        paddingLeft: 14,
        borderLeftWidth: 0.666667,
        borderLeftColor: '#E6E2D8'
    },
    metrica: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 8 },
    textosMetrica: { flex: 1 },
    aviso: { marginTop: 18 },
    incerta: {
        marginTop: 10,
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(214, 140, 58, 0.12)'
    }
});

export { estilos };
