import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    conteudo: { height: 429, paddingTop: 24 },
    instrucao: {
        height: 19,
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 17,
        textAlign: 'center'
    },
    calendario: {
        height: 282,
        marginTop: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: cores.neutras.bordaClara,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        paddingTop: 16,
        paddingHorizontal: 14
    },
    aviso: {
        marginTop: 15,
        minHeight: 53,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        gap: 7,
        borderRadius: 10,
        backgroundColor: '#FDF0EC'
    },
    avisoIcone: {
        color: '#B43D3D',
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 18
    },
    avisoTexto: {
        flex: 1,
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
        paddingHorizontal: 0,
        paddingTop: 12,
        paddingBottom: 20,
        gap: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: cores.neutras.bordaClara,
        backgroundColor: '#FFFFFF'
    },
    botao: { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    botaoGrande: { height: 54, borderRadius: 14 },
    botaoPrimario: { backgroundColor: '#B43D3D' },
    botaoSecundario: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E2D8' },
    desativado: { opacity: 0.5 },
    textoBotao: { color: '#5C5C59', fontFamily: fontFamilies.medium, fontSize: 16, lineHeight: 24 },
    textoBotaoPrimario: { color: '#FFFFFF', fontFamily: fontFamilies.semibold }
});

export { estilos };
