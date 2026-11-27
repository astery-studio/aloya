// Define os estilos tematizados dos cartões virtualizados do histórico.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

// Converte os tokens do tema em estilos nativos do cartão de registro.
function criarEstilos(tema) {
    const cores = obterCoresDiario(tema).interface;
    return StyleSheet.create({
        cartao: {
            width: '100%',
            flexDirection: 'column',
            alignItems: 'flex-start',
            overflow: 'hidden',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderWidth: 0.70489,
            borderColor: cores.borda,
            borderRadius: 16,
            backgroundColor: cores.superficie,
            ...tema.shadows.card
        },
        cabecalho: {
            alignSelf: 'stretch',
            minHeight: 26,
            height: 26,
            flexDirection: 'row',
            alignItems: 'center'
        },
        lateralCabecalho: {
            width: 56,
            height: 26,
            alignItems: 'flex-start',
            justifyContent: 'center'
        },
        lateralSomenteLeitura: { width: 26 },
        iconeRegistro: {
            width: 26,
            height: 26,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0.705,
            borderRadius: 10
        },
        areaData: { flex: 1, minHeight: 26, alignItems: 'center', justifyContent: 'center' },
        data: {
            color: cores.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            lineHeight: 24
        },
        acoes: {
            width: 56,
            height: 26,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 4
        },
        conteudo: {
            alignSelf: 'stretch',
            marginTop: 6,
            paddingTop: 10,
            borderTopWidth: 0.70489,
            borderTopColor: cores.separador
        },
        rotuloSecao: {
            color: cores.destaque,
            fontFamily: fontFamilies.bold,
            fontSize: 8,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 15,
            letterSpacing: 0.6,
            textAlign: 'center',
            textTransform: 'uppercase'
        },
        chips: {
            alignItems: 'center',
            marginTop: 4,
            paddingTop: 6,
            paddingBottom: 10
        },
        linhaChips: {
            minHeight: 28,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5
        },
        chip: {
            maxWidth: '100%',
            minHeight: 24,
            height: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderWidth: 0.7,
            borderColor: cores.borda,
            borderRadius: tema.radius.circular,
            backgroundColor: cores.superficie
        },
        iconeChip: {
            width: 10.89,
            height: 16.5,
            alignItems: 'center',
            justifyContent: 'center'
        },
        textoChip: {
            height: 16.5,
            color: tema.escuro ? cores.textoSecundario : '#5C5C59',
            fontFamily: fontFamilies.semiBold,
            fontSize: 8.56,
            fontWeight: '600',
            lineHeight: 16.5,
            textAlignVertical: 'center',
            includeFontPadding: false
        },
        anotacao: {
            gap: 8,
            paddingTop: 12,
            paddingBottom: 12
        },
        divisorConteudo: {
            alignSelf: 'stretch',
            height: StyleSheet.hairlineWidth,
            backgroundColor: cores.separador
        },
        textoAnotacao: {
            padding: 10,
            borderWidth: 1,
            borderColor: cores.borda,
            borderRadius: 8,
            color: cores.textoSecundario,
            backgroundColor: tema.escuro ? cores.superficieElevada : cores.fundo,
            fontFamily: fontFamilies.regular,
            fontSize: 11,
            lineHeight: 16
        },
        containerFase: {
            alignSelf: 'stretch',
            paddingTop: 6,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: cores.separador
        },
        fase: {
            alignSelf: 'stretch',
            minHeight: 26,
            height: 26,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 0,
            borderRadius: 100
        },
        textoFase: {
            flexShrink: 1,
            fontFamily: fontFamilies.semiBold,
            fontSize: 10,
            fontWeight: '600',
            lineHeight: 19.5,
            textAlign: 'center'
        },
        pressionado: { opacity: 0.72 }
    });
}

export { criarEstilos };
