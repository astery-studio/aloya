import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const superficie = tema.cores.interface.superficieElevada;
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
            borderColor: tema.cores.interface.borda,
            borderRadius: 16
        },
        tituloPainel: {
            color: tema.cores.interface.textoPrincipal,
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
            backgroundColor: tema.escuro ? tema.cores.interface.destaqueSuave : '#EEF4F0',
            borderRadius: 999
        },
        textoContador: {
            color: tema.escuro ? tema.cores.interface.destaque : '#2C4C3B',
            fontFamily: fontFamilies.semibold,
            fontSize: 12,
            lineHeight: 18,
            includeFontPadding: false
        },
        descricao: {
            width: '100%',
            marginTop: 4,
            color: tema.cores.interface.textoSecundario,
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
        macro: {
            width: '100%',
            overflow: 'hidden',
            backgroundColor: superficie,
            borderWidth: 0.7,
            borderColor: tema.cores.interface.borda,
            borderRadius: 12
        },
        macroExpandida: {
            borderWidth: 1.41,
            borderRadius: 14
        },
        macroCabecalho: {
            width: '100%',
            minHeight: 60,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            gap: 10
        },
        expansao: {
            minWidth: 0,
            flex: 1,
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },
        pressionado: {
            opacity: 0.72
        },
        caixaIcone: {
            width: 34,
            height: 34,
            flexShrink: 0,
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
            lineHeight: 21,
            includeFontPadding: false
        },
        categorias: {
            width: '100%'
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
            borderTopColor: tema.cores.interface.separador
        },
        nomeCategoria: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 22,
            includeFontPadding: false
        },
        nomeCategoriaDesativada: {
            color: tema.cores.interface.textoDesabilitado
        },
        estadoCentral: {
            minHeight: 280,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            paddingHorizontal: 24
        },
        textoEstado: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        },
        rodape: {
            width: '100%',
            minHeight: 87,
            flexShrink: 0,
            alignItems: 'center',
            paddingTop: 12,
            paddingHorizontal: 24,
            paddingBottom: 20,
            backgroundColor: superficie,
            borderTopWidth: 0.7,
            borderTopColor: tema.cores.interface.borda
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
