import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    const fundoSheet = tema.escuro ? '#1F1F1F' : tema.cores.interface.superficieElevada;
    const coral = tema.escuro ? '#EE9297' : '#B43D3D';

    return StyleSheet.create({
        conteudoRolavel: { flexShrink: 1, backgroundColor: fundoSheet },
        conteudoRolavelInterno: { paddingTop: 24, paddingBottom: 8 },
        instrucao: {
            height: 19,
            color: tema.escuro ? '#AAA6AA' : tema.cores.interface.textoSecundario,
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
            borderColor: tema.escuro ? '#3A3A3A' : tema.cores.interface.borda,
            borderRadius: 16,
            backgroundColor: tema.escuro ? '#242424' : tema.cores.interface.superficie,
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
            backgroundColor: tema.escuro ? '#4A3737' : '#FDF0EC'
        },
        avisoIcone: {
            color: tema.escuro ? '#F39A9D' : '#B43D3D',
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 18
        },
        avisoTexto: {
            flex: 1,
            color: tema.escuro ? '#F39A9D' : '#B43D3D',
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 17
        },
        erro: {
            padding: 16,
            color: tema.cores.feedback.erro,
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
            borderColor: tema.escuro ? '#3A3A3A' : tema.cores.interface.borda,
            backgroundColor: fundoSheet
        },
        botao: {
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12
        },
        botaoGrande: { height: 54, borderRadius: 14 },
        botaoPrimario: { backgroundColor: coral },
        botaoSecundario: {
            backgroundColor: tema.escuro ? '#242424' : tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.escuro ? '#3A3A3A' : tema.cores.interface.borda
        },
        desativado: { opacity: 0.5 },
        textoBotao: {
            color: tema.escuro ? '#F4F1EA' : tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 16,
            lineHeight: 24
        },
        textoBotaoPrimario: {
            color: tema.escuro ? '#151515' : '#FFFFFF',
            fontFamily: fontFamilies.semibold
        }
    });
}

export { criarEstilos };
