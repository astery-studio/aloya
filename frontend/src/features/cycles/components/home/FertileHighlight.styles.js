import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    margem: { width: 358, maxWidth: '100%', minHeight: 87.67, paddingTop: 20 },
    container: {
        width: '100%',
        minHeight: 67.67,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1.33333,
        borderStyle: 'dashed',
        borderRadius: 16
    },
    icone: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        borderRadius: 12
    },
    textos: { flexShrink: 1, minHeight: 41 },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 14,
        fontWeight: '700',
        includeFontPadding: false,
        lineHeight: 21
    },
    descricao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        fontWeight: '400',
        includeFontPadding: false,
        lineHeight: 20
    }
});

export { estilos };
