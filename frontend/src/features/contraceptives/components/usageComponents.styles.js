import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

// A célula e o marcador da legenda usam a mesma fonte de cor; hoje só acrescenta borda.
const coresHistorico = Object.freeze({
    confirmado: 'rgba(44, 76, 59, 0.8)',
    foraDoPrazo: 'rgba(214, 140, 58, 0.8)',
    naoConfirmado: 'rgba(200, 90, 68, 0.8)'
});

function criarEstilosUso(tema) {
    const interfaceTema = tema.cores.interface;
    return StyleSheet.create({
        banner: {
            width: '100%',
            maxWidth: 350.01,
            minHeight: 39.41,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            flexGrow: 0,
            flexShrink: 0,
            gap: 7,
            paddingVertical: 9,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: '#FBF3E0',
            borderWidth: 0.70489,
            borderColor: '#E8C97A'
        },
        textoBanner: {
            minWidth: 142,
            minHeight: 20,
            flexGrow: 0,
            flexShrink: 1,
            includeFontPadding: false,
            color: '#B07D2A',
            fontFamily: fontFamilies.semibold,
            fontWeight: '600',
            fontSize: 13,
            lineHeight: 20
        },
        painel: { width: '100%', flexGrow: 0 },
        painelExpandido: { width: 'auto', alignSelf: 'stretch', marginHorizontal: -16 },
        cabecalhoPainel: { width: '100%', minHeight: 28, alignItems: 'center', paddingTop: 10 },
        botaoPainel: {
            minWidth: 124.99,
            minHeight: 18,
            flexDirection: 'row',
            alignItems: 'center',
            flexGrow: 0,
            flexShrink: 0,
            gap: 4
        },
        tituloPainel: {
            minWidth: 93,
            minHeight: 18,
            flexGrow: 0,
            flexShrink: 0,
            includeFontPadding: false,
            color: interfaceTema.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontWeight: '500',
            fontSize: 12,
            lineHeight: 18,
            textAlign: 'center'
        },
        conteudoPainel: {
            width: '100%',
            alignItems: 'center',
            paddingTop: 8,
            paddingHorizontal: 16
        },
        listaRegistros: { width: '100%', alignItems: 'flex-start', gap: 6 },
        registro: {
            width: '100%',
            minHeight: 95,
            alignItems: 'flex-start',
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor: interfaceTema.superficieElevada,
            borderRadius: 10
        },
        registroNaoConfirmado: { minHeight: 91 },
        cabecalhoRegistro: {
            width: '100%',
            minHeight: 23,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            columnGap: 6,
            rowGap: 6
        },
        dataRegistro: {
            minHeight: 20,
            flexShrink: 0,
            includeFontPadding: false,
            color: interfaceTema.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontWeight: '700',
            fontSize: 13,
            lineHeight: 20
        },
        statusRegistro: { flexShrink: 0, alignItems: 'flex-start' },
        linhaHorario: {
            width: '100%',
            minHeight: 26,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 6,
            paddingTop: 8
        },
        linhaConfirmacao: {
            width: '100%',
            minHeight: 22,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 6,
            paddingTop: 4
        },
        linhaSemConfirmacao: { width: '100%', minHeight: 18, alignItems: 'flex-start' },
        rotuloHorarioProgramado: {
            minHeight: 18,
            flexShrink: 0,
            includeFontPadding: false,
            color: interfaceTema.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontWeight: '400',
            fontSize: 12,
            lineHeight: 18
        },
        rotuloConfirmacao: {
            minHeight: 18,
            flexShrink: 0,
            includeFontPadding: false,
            color: interfaceTema.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontWeight: '400',
            fontSize: 12,
            lineHeight: 18
        },
        horaRegistro: {
            minHeight: 18,
            flexShrink: 0,
            includeFontPadding: false,
            color: interfaceTema.textoPrincipal,
            fontFamily: fontFamilies.semibold,
            fontWeight: '600',
            fontSize: 12,
            lineHeight: 18
        },
        textoSemConfirmacao: {
            minHeight: 18,
            includeFontPadding: false,
            color: interfaceTema.textoDesabilitado,
            fontFamily: fontFamilies.regular,
            fontWeight: '400',
            fontSize: 12,
            lineHeight: 18
        },
        calendario: {
            width: '100%',
            maxWidth: 315.21,
            minHeight: 256.43,
            alignItems: 'flex-start',
            flexGrow: 0,
            flexShrink: 0,
            padding: 8,
            backgroundColor: interfaceTema.superficieElevada,
            borderRadius: 12
        },
        calendarioSeisSemanas: { minHeight: 291.43 },
        cabecalhoCalendario: {
            width: '100%',
            minHeight: 22,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        botaoMes: {
            width: 26,
            height: 22,
            flexDirection: 'row',
            alignItems: 'center',
            flexGrow: 0,
            flexShrink: 0,
            paddingVertical: 4,
            paddingHorizontal: 6
        },
        tituloMes: {
            minHeight: 18,
            flexShrink: 1,
            minWidth: 0,
            includeFontPadding: false,
            color: interfaceTema.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontWeight: '700',
            fontSize: 12,
            lineHeight: 18
        },
        margemDiasSemana: {
            width: '100%',
            minHeight: 19.49,
            alignItems: 'flex-start',
            paddingTop: 6
        },
        diasSemana: { width: '100%', minHeight: 13.49, flexDirection: 'row' },
        diaSemana: {
            flex: 1,
            minHeight: 13.49,
            includeFontPadding: false,
            color: interfaceTema.textoDesabilitado,
            fontFamily: fontFamilies.semibold,
            fontWeight: '600',
            fontSize: 9,
            lineHeight: 14,
            letterSpacing: 0.18,
            textAlign: 'center'
        },
        margemGradeDias: {
            width: '100%',
            minHeight: 175.96,
            alignItems: 'flex-start',
            paddingTop: 2
        },
        margemGradeDiasSeisSemanas: { minHeight: 210.96 },
        gradeDias: { width: '100%', minHeight: 173.96, gap: 1 },
        gradeDiasSeisSemanas: { minHeight: 208.96 },
        linhaSemana: { width: '100%', minHeight: 34, flexDirection: 'row', gap: 1 },
        celulaDia: {
            flex: 1,
            minHeight: 34,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            borderRadius: 8
        },
        celulaHoje: { borderWidth: 1, borderColor: interfaceTema.borda },
        numeroDia: {
            minHeight: 12,
            includeFontPadding: false,
            color: interfaceTema.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontWeight: '400',
            fontSize: 12,
            lineHeight: 12,
            textAlign: 'center'
        },
        numeroDiaHoje: { fontFamily: fontFamilies.bold, fontWeight: '900' },
        diaComEstado: { color: '#FFFFFF' },
        celula_confirmado: { backgroundColor: coresHistorico.confirmado },
        celula_foraDoPrazo: { backgroundColor: coresHistorico.foraDoPrazo },
        celula_naoConfirmado: { backgroundColor: coresHistorico.naoConfirmado },
        // Cada item mede seu texto nativo. Se faltar espaço, a legenda cresce por linhas.
        legenda: {
            width: '100%',
            minHeight: 23,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            paddingTop: 8,
            paddingHorizontal: 13
        },
        itemLegenda: {
            minHeight: 15,
            flexDirection: 'row',
            alignItems: 'center',
            flexGrow: 0,
            flexShrink: 0,
            gap: 4
        },
        marcadorLegenda: {
            width: 5.99,
            height: 5.99,
            flexGrow: 0,
            flexShrink: 0,
            borderRadius: 2.99578
        },
        marcador_confirmado: { backgroundColor: coresHistorico.confirmado },
        marcador_foraDoPrazo: { backgroundColor: coresHistorico.foraDoPrazo },
        marcador_naoConfirmado: { backgroundColor: coresHistorico.naoConfirmado },
        textoLegenda: {
            minHeight: 15,
            flexGrow: 0,
            flexShrink: 0,
            includeFontPadding: false,
            color: interfaceTema.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontWeight: '400',
            fontSize: 10,
            lineHeight: 15
        }
    });
}

const estilosUso = criarEstilosUso(temaClaro);

export { criarEstilosUso, estilosUso };
