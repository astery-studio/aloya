import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            minHeight: 56,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 13,
            paddingVertical: 9,
            backgroundColor: tema.cores.interface.superficie
        },

        desabilitado: {
            opacity: 0.5
        },

        caixaIcone: {
            width: 36,
            height: 36,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.cores.icones.configuracoes.azul.caixa,
            borderRadius: 10
        },

        conteudoTexto: {
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },

        label: {
            flex: 1,
            minWidth: 0,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            lineHeight: 24,
            includeFontPadding: false
        },

        preferencia: {
            flexShrink: 0,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            lineHeight: 21,
            includeFontPadding: false,
            textAlign: 'right'
        }
    });
}

export { criarEstilos };
