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
    cabecalho: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 5,
        height: 54
    },
    icone: {
        alignItems: 'center',
        backgroundColor: '#E8F0F3',
        borderRadius: 18,
        height: 54,
        justifyContent: 'center',
        width: 54
    },
    rotulo: {
        color: '#847F76',
        fontFamily: fontFamilies.bold,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
        lineHeight: 16,
        textTransform: 'uppercase'
    },
    pergunta: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 26,
        letterSpacing: -0.91,
        lineHeight: 39,
        paddingVertical: 10
    },
    formulario: {
        gap: 13
    },
    entrada: {
        backgroundColor: '#F7F5F0',
        borderColor: '#A8A49C',
        borderRadius: 12,
        borderWidth: 0.7,
        height: 123,
        padding: 13
    },
    textoEntrada: {
        fontSize: 16,
        fontFamily: fontFamilies.regular,
        lineHeight: 24,
        minHeight: 95.6,
        textAlignVertical: 'top'
    }
});

export { estilos };
