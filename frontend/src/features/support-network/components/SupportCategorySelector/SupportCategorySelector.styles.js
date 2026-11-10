//Define a apresentação do acordeão de categorias cadastradas.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            height: 68,
            overflow: 'hidden',
            backgroundColor: tema.cores.interface.superficie,
            borderRadius: 14
        },

        containerExpandido: {
            height: 272,
            borderWidth: 1.41,
            borderColor: tema.escuro ? tema.cores.interface.destaque : 'rgba(44, 76, 59, 0.33)'
        },

        cabecalho: {
            width: '100%',
            height: 68,
            minHeight: 60,
            paddingHorizontal: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            backgroundColor: tema.cores.interface.superficie
        },

        cabecalhoExpandido: {
            height: 60,
            backgroundColor: tema.escuro
                ? tema.cores.interface.destaqueSuave
                : 'rgba(238, 244, 240, 0.53)'
        },

        caixaIcone: {
            width: 34,
            height: 34,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.escuro ? tema.cores.interface.destaqueSuave : '#EEF4F0',
            borderRadius: 9
        },

        titulo: {
            width: 178,
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            fontWeight: '600',
            lineHeight: 21,
            textAlign: 'center',
            includeFontPadding: false
        },

        tituloExpandido: {
            color: tema.cores.interface.destaque
        },

        conteudo: {
            width: '100%',
            flex: 1,
            backgroundColor: tema.cores.interface.superficie
        },

        lista: {
            width: '100%'
        },

        conteudoLista: {
            width: '100%',
            alignItems: 'flex-start'
        },

        opcaoCategoria: {
            width: '100%',
            height: 52,
            paddingVertical: 6,
            paddingHorizontal: 40,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },

        containerTextoOpcao: {
            width: 225.18,
            minWidth: 0,
            flexShrink: 1,
            flexDirection: 'column',
            alignItems: 'flex-start'
        },

        textoOpcao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 22.5
        },

        estado: {
            width: '100%',
            minHeight: 96,
            paddingHorizontal: 18,
            paddingVertical: 20,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
        },

        textoEstado: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center'
        },

        textoErro: {
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center'
        },

        botaoTentarNovamente: {
            minHeight: 40,
            paddingHorizontal: 18,
            paddingVertical: 9,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.cores.interface.destaque,
            borderRadius: tema.radius.buttonAndInput
        },

        textoBotao: {
            color: tema.cores.interface.textoSobreDestaque,
            fontFamily: fontFamilies.semibold,
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 20
        },

        pressionado: {
            opacity: 0.72
        },

        desabilitado: {
            opacity: 0.5
        }
    });
}

export { criarEstilos };
