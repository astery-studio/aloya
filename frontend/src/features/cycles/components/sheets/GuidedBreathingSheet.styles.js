import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    painel: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 48,
        paddingHorizontal: 24,
        paddingTop: 8
    },
    conteudo: {},
    rotulo: {
        color: '#847F76',
        fontFamily: fontFamilies.bold,
        fontSize: 10,
        fontWeight: '700',
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
    areaRespiracao: {
        height: 169,
        alignItems: 'center',
        paddingTop: 39
    },
    circulo: {
        alignItems: 'center',
        height: 130,
        justifyContent: 'center',
        width: 130
    },
    circuloInterno: {
        alignItems: 'center',
        borderBottomLeftRadius: 61.19,
        borderBottomRightRadius: 59.92,
        borderTopLeftRadius: 60.01,
        borderTopRightRadius: 61.1,
        boxShadow: '0px 16.7686px 37.2636px rgba(74, 117, 142, 0.24)',
        height: 121.11,
        justifyContent: 'center',
        width: 121.11
    },
    gradiente: { position: 'absolute' },
    instrucao: {
        color: '#FFFFFF',
        fontFamily: fontFamilies.bold,
        fontSize: 11.18,
        fontWeight: '700',
        lineHeight: 17
    }
});

export { estilos };
