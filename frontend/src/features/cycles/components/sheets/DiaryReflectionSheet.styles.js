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
        paddingBottom: 12
    },
    cabecalho: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 14
    },
    icone: {
        alignItems: 'center',
        backgroundColor: '#E7F0F4',
        borderRadius: 18,
        height: 56,
        justifyContent: 'center',
        width: 56
    },
    rotulo: {
        color: '#8A867E',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.4,
        textTransform: 'uppercase'
    },
    pergunta: {
        color: '#222222',
        fontSize: 30,
        lineHeight: 38
    },
    entrada: {
        backgroundColor: '#F8F6F1',
        borderColor: '#A9A398',
        borderRadius: 16,
        borderWidth: 1,
        minHeight: 144,
        padding: 16
    },
    textoEntrada: {
        fontSize: 18,
        minHeight: 108,
        textAlignVertical: 'top'
    }
});

export { estilos };
