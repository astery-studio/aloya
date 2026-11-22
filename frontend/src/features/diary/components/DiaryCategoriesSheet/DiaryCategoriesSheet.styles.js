import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

function criarEstilos(tema) {
    const cores = obterCoresDiario(tema).interface;
    const superficie = cores.superficie;
    return StyleSheet.create({
        painel: {
            width: 390,
            maxWidth: '100%',
            height: 734,
            maxHeight: '92%',
            alignSelf: 'center',
            paddingBottom: 0,
            backgroundColor: superficie
        },
        areaConteudo: {
            height: 593,
            flexShrink: 1,
            backgroundColor: superficie
        },
        rolagem: {
            flexShrink: 1
        },
        conteudo: {
            flexGrow: 1,
            alignItems: 'center',
            paddingTop: 20,
            paddingBottom: 24
        },
        painelCategorias: {
            width: '100%',
            padding: 16,
            alignItems: 'center',
            backgroundColor: superficie,
            borderWidth: 1.41,
            borderColor: cores.borda,
            borderRadius: 16
        },
        tituloPainel: {
            color: cores.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 15,
            lineHeight: 21,
            textAlign: 'center',
            includeFontPadding: false
        },
        contador: {
            minWidth: 85,
            minHeight: 26,
            marginTop: 4,
            paddingHorizontal: 10,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
            backgroundColor: cores.destaqueSuave,
            borderRadius: 999
        },
        textoContador: {
            color: cores.destaque,
            fontFamily: fontFamilies.semibold,
            fontSize: 12,
            lineHeight: 18,
            includeFontPadding: false
        },
        descricao: {
            width: '100%',
            marginTop: 4,
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19,
            textAlign: 'center',
            includeFontPadding: false
        },
        lista: {
            width: '100%',
            marginTop: 14,
            gap: 8
        },
        categoria: {
            width: '100%',
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 6,
            paddingRight: 12,
            paddingBottom: 6,
            paddingLeft: 58,
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
            lineHeight: 22,
            includeFontPadding: false
        },
        nomeCategoriaDesativada: {
            color: cores.textoDesabilitado
        },
        estadoCentral: {
            minHeight: 280,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            paddingHorizontal: 24
        },
        textoEstado: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        },
        rodape: {
            alignSelf: 'stretch',
            marginHorizontal: -tema.espacamentosLayout.margemHorizontalTela,
            minHeight: 87,
            flexShrink: 0,
            alignItems: 'center',
            paddingTop: 12,
            paddingHorizontal: 24,
            paddingBottom: 20,
            backgroundColor: superficie,
            borderTopWidth: 1,
            borderTopColor: cores.borda
        },
        botaoSalvar: {
            width: 342,
            maxWidth: '100%',
            height: 54,
            paddingTop: 15.375,
            paddingBottom: 14.625,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 14
        }
    });
}

export { criarEstilos };
