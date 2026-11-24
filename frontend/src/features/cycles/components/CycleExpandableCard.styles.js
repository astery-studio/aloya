import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        borderRadius: 23,
        overflow: 'hidden'
    },
    trigger: {
        width: '100%',
        minHeight: 76,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingVertical: 15,
        paddingHorizontal: 17
    },
    desabilitado: { opacity: 0.45 },
    titleArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    textos: { flex: 1 },
    rotulo: {
        color: '#4A758E',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        fontWeight: '700',
        lineHeight: 14,
        textTransform: 'uppercase'
    },
    title: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 13,
        lineHeight: 20
    },
    titleComRotulo: { marginTop: 5, fontSize: 14, lineHeight: 21 },
    subtitle: {
        marginTop: 3,
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 10,
        lineHeight: 15
    },
    content: { paddingHorizontal: 17, paddingBottom: 17 }
});

export { estilos };
