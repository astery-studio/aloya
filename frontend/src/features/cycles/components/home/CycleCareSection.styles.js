import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    secao: { width: '100%', paddingTop: 34, paddingHorizontal: 16 },
    etiqueta: {
        color: '#C85A44',
        fontFamily: fontFamilies.bold,
        fontSize: 11,
        lineHeight: 16,
        letterSpacing: 0.88,
        textTransform: 'uppercase'
    },
    tituloSecao: {
        marginTop: 4,
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 21,
        lineHeight: 24,
        letterSpacing: -0.525
    },
    lista: { gap: 10, paddingTop: 16 },
    card: {
        width: '100%',
        minHeight: 84,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        borderRadius: 21
    },
    caixaIcone: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 17
    },
    textos: { flex: 1 },
    categoria: {
        color: '#847F76',
        fontFamily: fontFamilies.bold,
        fontSize: 8,
        lineHeight: 12,
        letterSpacing: 0.64,
        textTransform: 'uppercase'
    },
    titulo: {
        marginTop: 4,
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 13,
        lineHeight: 20
    },
    descricao: {
        marginTop: 3,
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 10,
        lineHeight: 15
    }
});

export { estilos };
