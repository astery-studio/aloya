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
    cardComResumo: { borderRadius: 22 },
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
    triggerComResumo: { minHeight: 78, paddingHorizontal: 14, paddingVertical: 12, gap: 11 },
    desabilitado: { opacity: 0.45 },
    titleArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    textos: { flex: 1 },
    rotulo: {
        color: '#4A758E',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        fontWeight: '700',
        includeFontPadding: false,
        lineHeight: 14,
        textTransform: 'uppercase'
    },
    title: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 13,
        includeFontPadding: false,
        lineHeight: 20
    },
    titleComRotulo: { marginTop: 5, fontSize: 14, lineHeight: 21 },
    titleComResumo: { fontSize: 12, lineHeight: 18 },
    subtitle: {
        marginTop: 3,
        color: '#847F76',
        fontFamily: fontFamilies.regular,
        fontSize: 9,
        includeFontPadding: false,
        lineHeight: 14
    },
    content: { paddingHorizontal: 17, paddingBottom: 17 },
    contentComResumo: { paddingHorizontal: 14, paddingBottom: 15 }
});

export { estilos };
