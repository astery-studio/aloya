import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    const coral = tema.escuro ? '#D47769' : '#C85A44';
    const faixa = tema.escuro ? 'rgba(212, 119, 105, 0.28)' : '#F6D8D1';

    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: tema.cores.interface.fundo },
        cabecalho: {
            minHeight: 67,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
            justifyContent: 'center',
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: tema.cores.interface.separador
        },
        titulo: {
            textAlign: 'center',
            marginLeft: 24,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            lineHeight: 39,
            color: tema.cores.interface.textoPrincipal
        },
        voltar: {
            position: 'absolute',
            left: 10,
            top: 13,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center'
        },
        corIconeCabecalho: tema.cores.interface.textoPrincipal,
        legenda: {
            minHeight: 40,
            paddingHorizontal: 24,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 30,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: tema.cores.interface.separador,
            flexWrap: 'wrap'
        },
        itemLegenda: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        textoLegenda: {
            fontFamily: fontFamilies.regular,
            fontSize: 11,
            lineHeight: 16,
            color: tema.cores.interface.textoSecundario
        },
        simboloAnterior: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: tema.escuro ? 'rgba(212, 119, 105, 0.08)' : 'rgba(200,90,68,0.1)',
            borderWidth: 0.7,
            borderColor: coral
        },
        simboloSelecionado: { width: 18, height: 10, borderRadius: 5, backgroundColor: coral },
        diasSemana: {
            flexDirection: 'row',
            paddingHorizontal: 8,
            height: 28,
            alignItems: 'center',
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: tema.cores.interface.separador
        },
        nomeSemana: {
            flex: 1,
            textAlign: 'center',
            fontFamily: fontFamilies.semibold,
            fontSize: 11,
            lineHeight: 16,
            letterSpacing: 0.44,
            color: tema.cores.interface.textoSecundario
        },
        mes: {
            paddingHorizontal: 8,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: tema.cores.interface.separador
        },
        tituloMes: {
            height: 42,
            marginHorizontal: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
        },
        nomeMes: {
            fontFamily: fontFamilies.bold,
            fontSize: 15,
            color: tema.cores.interface.textoPrincipal
        },
        ano: {
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18,
            color: tema.cores.interface.textoSecundario
        },
        semana: { flexDirection: 'row', height: 52 },
        celula: { flex: 1, alignItems: 'center', justifyContent: 'center' },
        dia: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center'
        },
        numero: {
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            color: tema.cores.interface.textoPrincipal
        },
        futuro: { color: tema.escuro ? '#343936' : '#CFCFC8' },
        numeroMarcado: { color: coral, fontFamily: fontFamilies.semibold },
        numeroPonta: { color: '#FFFFFF' },
        registrado: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: tema.escuro ? 'rgba(212, 119, 105, 0.08)' : 'rgba(200,90,68,0.1)',
            borderColor: coral,
            borderWidth: 0.7
        },
        ponta: { backgroundColor: coral, width: 42, height: 42, borderRadius: 21 },
        faixa: { position: 'absolute', height: 42, left: 0, right: 0, backgroundColor: faixa },
        inicioFaixa: { left: 5, borderTopLeftRadius: 21, borderBottomLeftRadius: 21 },
        fimFaixa: { right: 5, borderTopRightRadius: 21, borderBottomRightRadius: 21 },
        ajuda: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginHorizontal: 20,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 0.7,
            borderColor: tema.cores.interface.destaque,
            borderRadius: 12,
            backgroundColor: tema.escuro ? 'transparent' : '#EFEFE8'
        },
        textoAjuda: {
            flex: 1,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            lineHeight: 20,
            color: tema.cores.interface.destaque
        },
        rodape: {
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 20,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: tema.cores.interface.separador,
            backgroundColor: tema.escuro ? '#1D211F' : tema.cores.interface.fundo
        },
        salvar: { minHeight: 56, borderRadius: 12 },
        iconeFeedback: { borderRadius: 14 },
        fundoIconeFeedback: tema.escuro ? '#4A3737' : '#F5EDE3',
        fundoIconeErro: tema.escuro ? '#343434' : '#EDEDED',
        corIconeFeedback: tema.escuro ? '#EE9297' : '#C85A44',
        corIconeErro: tema.escuro ? '#F39A9D' : '#B43D3D',
        vazio: {
            padding: 24,
            fontFamily: fontFamilies.regular,
            color: tema.cores.interface.textoSecundario
        }
    });
}

export { criarEstilos };
