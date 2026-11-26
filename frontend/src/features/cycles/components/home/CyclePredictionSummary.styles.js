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
        boxShadow: '0px 20px 36px rgba(44, 76, 59, 0.15)'
    },
    cabecalho: {
        minHeight: 46,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12
    },
    textosCabecalho: { flexShrink: 1 },
    metricas: { minHeight: 75, flexDirection: 'row', gap: 16, marginTop: 20 },
    data: { width: 138, maxWidth: '43%', flexDirection: 'row', alignItems: 'center', gap: 9 },
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
    incerta: { marginTop: 18 }
});

export { estilos };
