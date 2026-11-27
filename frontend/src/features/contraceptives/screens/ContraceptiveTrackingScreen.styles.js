import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilosAcompanhamento(tema, somenteLeitura = false) {
    const interfaceTema = tema.cores.interface;
    const { margemHorizontalTela } = tema.espacamentosLayout;
    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: tema.escuro ? '#121212' : interfaceTema.fundo },
        corpo: {
            flex: 1,
            minHeight: 0,
            paddingTop: tema.espacamentosLayout.headerParaConteudo
        },
        areaBanner: {
            width: '100%',
            maxWidth: 393.33,
            alignSelf: 'center',
            paddingHorizontal: 21.66,
            paddingBottom: 16
        },
        rolagem: { flex: 1 },
        lista: {
            flexGrow: 1,
            width: '100%',
            maxWidth: 393.33,
            alignSelf: 'center',
            paddingHorizontal: somenteLeitura ? margemHorizontalTela : 21.66,
            paddingBottom: 12
        },
        rotuloSecao: {
            width: '100%',
            height: 34,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingBottom: 16
        },
        rotuloSecaoSeguinte: { height: 54, paddingTop: 20 },
        linhaRotulo: {
            flex: 1,
            height: StyleSheet.hairlineWidth,
            backgroundColor: interfaceTema.separador
        },
        textoRotulo: {
            color: interfaceTema.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 0.72
        },
        espacoCartao: { height: 12 },
        estadoCentral: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            paddingHorizontal: somenteLeitura ? margemHorizontalTela : 0,
            paddingTop: tema.espacamentosLayout.headerParaConteudo
        },
        mensagemEstado: {
            color: interfaceTema.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            lineHeight: 22
        },
        estadoVazio: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: tema.espacamentosLayout.headerParaConteudo,
            paddingHorizontal: somenteLeitura ? margemHorizontalTela : 22
        },
        tituloVazio: {
            color: interfaceTema.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            lineHeight: 27,
            textAlign: 'center'
        },
        mensagemVazio: {
            width: '100%',
            maxWidth: 310,
            paddingTop: 10,
            color: interfaceTema.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            lineHeight: 22.5,
            textAlign: 'center'
        }
    });
}

const estilosAcompanhamento = criarEstilosAcompanhamento(temaClaro);

export { criarEstilosAcompanhamento, estilosAcompanhamento };
