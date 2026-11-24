import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    painel: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 48,
        paddingHorizontal: 24,
        paddingTop: 0
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 23
    },
    circulo: {
        alignItems: 'center',
        backgroundColor: '#7CA4B7',
        borderRadius: 65,
        height: 130,
        justifyContent: 'center',
        shadowColor: '#4D7891',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.24,
        shadowRadius: 37,
        width: 130
    },
    instrucao: {
        color: '#FFFFFF',
        fontFamily: fontFamilies.bold,
        fontSize: 11.18,
        fontWeight: '700',
        lineHeight: 17
    }
});

export { estilos };
