import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    educativa: {
        minHeight: 46,
        gap: 7,
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 13
    },
    contraceptiva: {
        minHeight: 43.67,
        gap: 8,
        paddingTop: 14,
        borderTopWidth: 0.666667,
        borderTopColor: '#E6E2D8'
    },
    texto: {
        flex: 1,
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        includeFontPadding: false
    },
    textoEducativo: { fontSize: 9, lineHeight: 13 },
    textoContraceptivo: { fontSize: 10, lineHeight: 14 }
});

export { estilos };
