import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    conteudo: {
        paddingBottom: 40
    },
    explore: {
        paddingHorizontal: 16,
        paddingTop: 34
    },
    rotuloExplore: {
        color: '#847F76',
        fontFamily: fontFamilies.bold,
        fontSize: 11,
        letterSpacing: 0.88,
        lineHeight: 16,
        textTransform: 'uppercase'
    },
    tituloExplore: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 21,
        letterSpacing: -0.525,
        lineHeight: 24,
        paddingTop: 4
    },
    sobreFase: {
        paddingHorizontal: 16,
        paddingTop: 34
    },
    descricaoFase: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 19,
        textAlign: 'justify'
    },
    avisoFase: {
        minHeight: 37,
        marginTop: 12,
        padding: 10,
        backgroundColor: '#F7F5F0',
        borderRadius: 12
    }
});

export { estilos };
