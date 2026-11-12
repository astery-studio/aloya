import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const superficie = tema.cores.interface.superficieElevada;
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
            borderColor: tema.cores.interface.borda,
            borderRadius: 16,
            backgroundColor: superficie
        },
        tituloSecao: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 15,
            lineHeight: 21,
            includeFontPadding: false
        },
        descricaoSecao: {
            width: '100%',
            marginTop: 4,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19,
            textAlign: 'center',
            includeFontPadding: false
        },
        camposData: { width: '100%', marginTop: 8, gap: 14 },
        grupoCampo: { width: '100%', alignItems: 'center', gap: 4 },
        rotuloCampo: {
            color: tema.cores.marca.secundaria,
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
            borderColor: tema.cores.interface.borda,
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
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            lineHeight: 21
        },
        grupoCategoria: {
            width: '100%',
            overflow: 'hidden',
            borderWidth: 0.7,
            borderColor: tema.cores.interface.borda,
            borderRadius: 12,
            backgroundColor: superficie
        },
        grupoCategoriaExpandido: { borderWidth: 1.41, borderRadius: 14 },
        cabecalhoCategoria: {
            width: '100%',
            minHeight: 60,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },
        expansaoCategoria: {
            minWidth: 0,
            minHeight: 44,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },
        iconeCategoria: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9
        },
        nomeMacro: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoPrincipal,
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
            borderTopColor: tema.cores.interface.separador
        },
        nomeCategoria: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 22
        },
        pressionado: { opacity: 0.72 },
        estadoCentral: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
        textoEstado: {
            color: tema.cores.interface.textoSecundario,
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
            borderTopColor: tema.cores.interface.borda,
            backgroundColor: superficie
        },
        botaoLimpar: {
            width: 342,
            maxWidth: '100%',
            height: 54,
            borderWidth: 1.41,
            borderColor: tema.cores.marca.primaria,
            borderRadius: 14
        },
        textoLimpar: { color: tema.cores.marca.primaria },
        botaoAplicar: { width: 342, maxWidth: '100%', height: 54, borderRadius: 14 }
    });
}

export { criarEstilos };
