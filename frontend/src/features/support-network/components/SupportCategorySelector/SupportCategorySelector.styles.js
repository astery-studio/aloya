//Define a apresentação do acordeão de categorias cadastradas.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            overflow: 'hidden',
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.borda,
            borderRadius: 14
        },

        containerExpandido: {
            borderColor: tema.cores.interface.destaque
        },

        cabecalho: {
            width: '100%',
            minHeight: 64,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: tema.cores.interface.superficie
        },

        cabecalhoExpandido: {
            backgroundColor: tema.cores.interface.destaqueSuave
        },

        caixaIcone: {
            width: 36,
            height: 36,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.cores.interface.destaqueSuave,
            borderRadius: 10
        },

        titulo: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.semibold,
            fontSize: 16,
            fontWeight: '600',
            lineHeight: 22,
            includeFontPadding: false
        },

        tituloExpandido: {
            color: tema.cores.interface.destaque
        },

        conteudo: {
            width: '100%',
            borderTopWidth: 1,
            borderTopColor: tema.cores.interface.borda,
            backgroundColor: tema.cores.interface.superficie
        },

        lista: {
            width: '100%',
            padding: 12,
            gap: 10
        },

        opcaoCategoria: {
            minHeight: 56
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
