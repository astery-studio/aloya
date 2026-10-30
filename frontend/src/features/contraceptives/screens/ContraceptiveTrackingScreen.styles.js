import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilosAcompanhamento(tema) {
    const interfaceTema = tema.cores.interface;
    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: interfaceTema.fundo },
        cabecalho: {
            width: '100%',
            maxWidth: 393.33,
            alignSelf: 'center',
            minHeight: 61,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 21.66,
            paddingVertical: 8.5
        },
        botaoVoltar: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
        titulo: {
            flex: 1,
            color: interfaceTema.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 26,
            lineHeight: 39,
            textAlign: 'center'
        },
        espacoCabecalho: { width: 44 },
        corpo: { flex: 1, minHeight: 0 },
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
            paddingHorizontal: 21.66,
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
        estadoCentral: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
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
            paddingHorizontal: 22
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
        },
        destaqueVazio: { fontFamily: fontFamilies.bold },
        // Em fluxo normal: a SafeArea mantém o botão acima da navegação do sistema.
        rodape: {
            flexShrink: 0,
            paddingTop: 12,
            paddingBottom: 2,
            backgroundColor: interfaceTema.fundo,
            borderTopWidth: 0.70489,
            borderTopColor: interfaceTema.borda
        },
        conteudoRodape: {
            width: '100%',
            maxWidth: 393.33,
            alignSelf: 'center',
            paddingHorizontal: 21.66
        },
        areaAcaoCadastro: { width: '100%', height: 56 }
    });
}

const estilosAcompanhamento = criarEstilosAcompanhamento(temaClaro);

export { criarEstilosAcompanhamento, estilosAcompanhamento };
