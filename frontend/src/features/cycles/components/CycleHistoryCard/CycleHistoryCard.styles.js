//Preserva as medidas e diferenças visuais dos ciclos concluído, em andamento e incerto.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const corAviso = tema.escuro ? '#F2B45F' : '#B97D22';
    const corMenstruacao = tema.escuro ? '#F08A75' : tema.cores.marca.primaria;

    return StyleSheet.create({
        container: {
            width: '100%',
            maxWidth: 350,
            alignSelf: 'center',
            overflow: 'hidden',
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.borda,
            borderRadius: 16
        },

        cabecalho: {
            width: '100%',
            minHeight: 69,
            justifyContent: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12
        },

        cabecalhoEmAndamento: {
            minHeight: 80
        },

        linhaDoCabecalho: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },

        identificacao: {
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20
        },

        numero: {
            width: 28,
            height: 28,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.escuro
                ? tema.cores.interface.destaqueSuave
                : tema.cores.icones.configuracoes.verde.caixa,
            borderRadius: 9
        },

        textoDoNumero: {
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.bold,
            fontSize: 13,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 20,
            includeFontPadding: false
        },

        textos: {
            flex: 1,
            minWidth: 0,
            justifyContent: 'center',
            gap: 2
        },

        periodo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 27,
            includeFontPadding: false
        },

        status: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 21,
            includeFontPadding: false
        },

        acoes: {
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center'
        },

        separador: {
            height: 1,
            marginHorizontal: 16,
            backgroundColor: tema.cores.interface.separador
        },

        conteudoInferior: {
            width: '100%',
            paddingTop: 12,
            flexDirection: 'column',
            alignItems: 'flex-start'
        },

        indicadores: {
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
            paddingBottom: 12
        },

        indicador: {
            minWidth: 0,
            height: 31,
            flexBasis: 140,
            flexGrow: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            paddingHorizontal: 10,
            borderWidth: 0.8,
            borderRadius: 999
        },

        indicadorMenstruacao: {
            borderColor: corMenstruacao
        },

        indicadorCiclo: {
            borderColor: 'rgba(44, 76, 59, 0.65)'
        },

        indicadorIndisponivel: {
            backgroundColor: tema.cores.interface.fundo,
            borderColor: tema.cores.interface.borda
        },

        valorDoIndicador: {
            flexShrink: 0,
            fontFamily: fontFamilies.bold,
            fontSize: 13,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 20,
            includeFontPadding: false
        },

        descricaoDoIndicador: {
            flexShrink: 1,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 20,
            includeFontPadding: false
        },

        textoMenstruacao: {
            color: corMenstruacao
        },

        textoCiclo: {
            color: tema.cores.interface.destaque
        },

        textoIndisponivel: {
            color: tema.cores.interface.textoDesabilitado
        },

        aviso: {
            width: 'auto',
            minHeight: 52,
            alignSelf: 'stretch',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginHorizontal: 16,
            marginBottom: 14,
            paddingHorizontal: 13,
            paddingVertical: 8,
            backgroundColor: tema.escuro ? 'rgba(242, 180, 95, 0.14)' : 'rgba(214, 140, 58, 0.14)',
            borderWidth: 0.7,
            borderColor: 'rgba(214, 140, 58, 0.5)',
            borderRadius: 10
        },

        textosDoAviso: {
            flex: 1,
            minWidth: 0
        },

        tituloDoAviso: {
            color: corAviso,
            fontFamily: fontFamilies.bold,
            fontSize: 13,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 19.5,
            includeFontPadding: false
        },

        mensagemDoAviso: {
            color: corAviso,
            fontFamily: fontFamilies.regular,
            fontSize: 11,
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 16.5,
            includeFontPadding: false
        }
    });
}

export { criarEstilos };
