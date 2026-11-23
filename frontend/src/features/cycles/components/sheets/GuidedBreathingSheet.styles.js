import { StyleSheet } from 'react-native';

const estilos = StyleSheet.create({
    painel: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 28
    },
    conteudo: {
        gap: 20,
        paddingBottom: 32
    },
    rotulo: {
        color: '#8A867E',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.4,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontSize: 30,
        lineHeight: 38
    },
    descricao: {
        color: '#66635E',
        fontSize: 17,
        lineHeight: 25
    },
    areaRespiracao: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240
    },
    circulo: {
        alignItems: 'center',
        backgroundColor: '#88AFC1',
        borderRadius: 90,
        height: 180,
        justifyContent: 'center',
        shadowColor: '#4D7891',
        shadowOpacity: 0.18,
        shadowRadius: 18,
        width: 180
    },
    instrucao: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700'
    }
});

export { estilos };
