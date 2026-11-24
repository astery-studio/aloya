import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    painel: {
        paddingBottom: 48
    },
    conteudo: {
        paddingHorizontal: 24
    },
    cabecalho: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 5,
        height: 54
    },
    icone: {
        alignItems: 'center',
        borderRadius: 18,
        height: 54,
        justifyContent: 'center',
        width: 54
    },
    rotulo: {
        color: '#847F76',
        flex: 1,
        fontFamily: fontFamilies.bold,
        fontSize: 10,
        letterSpacing: 0.8,
        lineHeight: 16,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 26,
        letterSpacing: -0.91,
        lineHeight: 39,
        paddingVertical: 10
    },
    descricao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        lineHeight: 21
    },
    aviso: {
        backgroundColor: '#F7F5F0',
        marginTop: 18,
        minHeight: 54,
        padding: 11
    },
    textoAviso: {
        fontSize: 10,
        lineHeight: 16
    }
});

export { estilos };
