import { StyleSheet } from 'react-native';
import { espacamentos, fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    area: {
        width: '100%',
        paddingTop: 34,
        paddingHorizontal: espacamentos.medio
    },
    card: {
        width: '100%',
        maxWidth: 358,
        alignSelf: 'center',
        alignItems: 'flex-start',
        padding: 18,
        borderRadius: 27,
        borderWidth: 0.7,
        borderColor: '#E6E2D8',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 34px rgba(34, 34, 34, 0.10)'
    },
    cabecalho: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6
    },
    rotulo: {
        color: '#D68C3A',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        lineHeight: 13.5,
        letterSpacing: 0.72,
        includeFontPadding: false,
        textTransform: 'uppercase'
    },
    selo: {
        paddingVertical: 5,
        paddingHorizontal: 7,
        alignItems: 'flex-start',
        borderRadius: 999,
        backgroundColor: 'rgba(44, 76, 59, 0.10)'
    },
    textoSelo: {
        color: '#2C4C3B',
        fontFamily: fontFamilies.regular,
        fontSize: 7,
        lineHeight: 10.5,
        includeFontPadding: false
    },
    conteudo: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 14,
        gap: 13
    },
    textos: { flex: 1, minWidth: 0 },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 19,
        lineHeight: 28.5,
        includeFontPadding: false
    },
    descricao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 10,
        lineHeight: 15,
        includeFontPadding: false
    },
    icone: { flexShrink: 0 }
});

export { estilos };
