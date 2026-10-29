import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    conteudo: { height: 429, paddingTop: 20 },
    instrucao: {
        height: 42,
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center'
    },
    calendario: {
        height: 282,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: cores.neutras.bordaClara,
        borderRadius: 16,
        backgroundColor: '#FFFFFF'
    },
    aviso: {
        marginTop: 15,
        minHeight: 53,
        justifyContent: 'center',
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#FDF0EC'
    },
    avisoTexto: {
        color: '#B43D3D',
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 17
    },
    erro: {
        padding: 16,
        color: '#B43D3D',
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        textAlign: 'center'
    },
    rodape: {
        height: 142,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 20,
        gap: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: cores.neutras.bordaClara,
        backgroundColor: '#FFFFFF'
    },
    botao: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    botaoPrimario: { backgroundColor: '#B43D3D' },
    botaoSecundario: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E2D8' },
    desativado: { opacity: 0.5 },
    textoBotao: { color: '#5C5C59', fontFamily: fontFamilies.medium, fontSize: 16, lineHeight: 24 },
    textoBotaoPrimario: { color: '#FFFFFF', fontFamily: fontFamilies.semibold }
});

export { estilos };
