import { StyleSheet } from 'react-native';
import { espacamentos, fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    area: { width: '100%', paddingTop: 34, paddingHorizontal: espacamentos.medio },
    secao: { width: '100%', maxWidth: 358, alignSelf: 'center', alignItems: 'flex-start' },
    rotulo: {
        color: '#D68C3A',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        lineHeight: 13.5,
        letterSpacing: 0.81,
        textTransform: 'uppercase',
        includeFontPadding: false
    },
    titulo: {
        paddingTop: 5,
        minHeight: 32,
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 23,
        lineHeight: 26.45,
        letterSpacing: -0.69,
        includeFontPadding: false
    },
    descricao: {
        alignSelf: 'stretch',
        paddingTop: 8,
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 11,
        lineHeight: 16.5,
        includeFontPadding: false
    },
    lista: { alignSelf: 'stretch', gap: 10, paddingTop: 16 },
    opcao: { minHeight: 78, flexShrink: 0 },
    linhaOpcao: { minHeight: 78, paddingVertical: 12, paddingHorizontal: 14, gap: 11 },
    caixaIcone: {
        width: 45,
        height: 45,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    areaIcone: {
        width: 24,
        paddingVertical: 2,
        paddingHorizontal: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tituloOpcao: { marginTop: 0, fontSize: 12, lineHeight: 18 },
    descricaoOpcao: { marginTop: 4, color: '#847F76', fontSize: 9, lineHeight: 13.5 },
    textoExpandido: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 11,
        lineHeight: 16.5
    }
});

export { estilos };
