//Define a apresentação dos cartões da lista de categorias de permissão.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        cartao: {
            width: '100%',
            overflow: 'hidden',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 14,
            gap: 14,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1.5,
            borderColor: tema.cores.interface.borda,
            borderRadius: tema.radius.grande
        },

        cartaoDesabilitado: {
            opacity: 0.65
        },

        conteudoPrincipal: {
            width: '100%',
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },

        caixaIcone: {
            width: 36,
            height: 36,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.cores.interface.fundo,
            borderWidth: 0.7,
            borderColor: tema.cores.interface.borda,
            borderRadius: 10
        },

        textos: {
            minWidth: 0,
            flex: 1,
            flexShrink: 1,
            paddingTop: 2,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start'
        },

        containerTitulo: {
            width: '100%',
            height: 24,
            alignItems: 'flex-start',
            justifyContent: 'center'
        },

        nome: {
            width: '100%',
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 24,
            includeFontPadding: false
        },

        containerResumo: {
            width: '100%',
            minHeight: 22,
            paddingTop: 4,
            paddingRight: 2,
            alignItems: 'flex-start',
            justifyContent: 'center'
        },

        resumo: {
            width: '100%',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 18,
            includeFontPadding: false
        },

        acoes: {
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            gap: 4
        },

        areaAcao: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center'
        },

        divisor: {
            width: '100%',
            height: 1,
            backgroundColor: tema.cores.interface.separador
        },

        contatos: {
            minHeight: 28,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9
        },

        textoContatos: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 22,
            includeFontPadding: false
        },

        quantidadeContatos: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontWeight: '700'
        }
    });
}

export { criarEstilos };
