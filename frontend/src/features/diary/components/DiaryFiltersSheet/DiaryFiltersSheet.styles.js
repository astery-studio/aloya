import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

function criarEstilos(tema) {
    const diario = obterCoresDiario(tema);
    const cores = diario.interface;
    const superficie = cores.superficie;
    return StyleSheet.create({
        painel: {
            width: 390,
            maxWidth: '100%',
            height: 734.16,
            maxHeight: '92%',
            alignSelf: 'center',
            paddingBottom: 0,
            backgroundColor: superficie
        },
        areaConteudo: {
            height: 528,
            flexShrink: 1,
            backgroundColor: superficie
        },
        rolagem: { flexShrink: 1 },
        conteudo: {
            flexGrow: 1,
            alignItems: 'center',
            gap: 14,
            paddingTop: 20,
            paddingBottom: 24
        },
        secao: {
            width: 342,
            maxWidth: '100%',
            alignItems: 'center',
            padding: 16,
            borderWidth: 1.41,
            borderColor: cores.borda,
            borderRadius: 16,
            backgroundColor: superficie
        },
        tituloSecao: {
            color: cores.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 15,
            lineHeight: 21,
            includeFontPadding: false
        },
        descricaoSecao: {
            width: '100%',
            marginTop: 4,
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19,
            textAlign: 'center',
            includeFontPadding: false
        },
        camposData: { width: '100%', marginTop: 8, gap: 14 },
        grupoCampo: { width: '100%', alignItems: 'center', gap: 4 },
        rotuloCampo: {
            color: cores.destaque,
            fontFamily: fontFamilies.medium,
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 0.24
        },
        campoDataComAcao: { width: '100%', position: 'relative' },
        entradaData: { paddingTop: 0 },
        campoData: { height: 60, borderWidth: 0.7 },
        limparData: {
            position: 'absolute',
            right: 14,
            top: 18,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center'
        },
        erroPeriodo: {
            width: '100%',
            marginTop: 10,
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18,
            textAlign: 'center'
        },
        listaOpcoes: { width: '100%', marginTop: 14, gap: 8 },
        opcaoFase: {
            width: '100%',
            height: 60,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 0.7,
            borderColor: cores.borda,
            borderRadius: 12,
            backgroundColor: superficie
        },
        identificacaoFase: { flexDirection: 'row', alignItems: 'center', gap: 16 },
        iconeFase: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9
        },
        nomeFase: {
            color: cores.textoPrincipal,
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            lineHeight: 21
        },
        opcaoCategoria: {
            width: '100%',
            minHeight: 52,
            paddingVertical: 6,
            paddingRight: 12,
            paddingLeft: 58,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderTopWidth: 0.7,
            borderTopColor: cores.separador
        },
        nomeCategoria: {
            minWidth: 0,
            flex: 1,
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 22
        },
        pressionado: { opacity: 0.72 },
        estadoCentral: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
        textoEstado: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21
        },
        rodape: {
            alignSelf: 'stretch',
            marginHorizontal: -tema.espacamentosLayout.margemHorizontalTela,
            minHeight: 152,
            flexShrink: 0,
            alignItems: 'center',
            gap: 12,
            paddingTop: 12,
            paddingHorizontal: 24,
            paddingBottom: 20,
            borderTopWidth: 1,
            borderTopColor: cores.borda,
            backgroundColor: superficie
        },
        botaoLimpar: {
            width: 342,
            maxWidth: '100%',
            height: 54,
            borderWidth: 1.41,
            borderColor: diario.primaria,
            borderRadius: 14,
            backgroundColor: superficie
        },
        textoLimpar: { color: diario.primaria },
        botaoAplicar: { width: 342, maxWidth: '100%', height: 54, borderRadius: 14 }
    });
}

export { criarEstilos };
