//Define a apresentação do seletor em lote de permissões.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            paddingHorizontal: 16,
            paddingTop: 18,
            paddingBottom: 16,
            alignItems: 'center',
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.borda,
            borderRadius: 14
        },

        titulo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 17,
            fontWeight: '700',
            lineHeight: 24,
            textAlign: 'center',
            includeFontPadding: false
        },

        descricao: {
            maxWidth: 280,
            marginTop: 6,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center',
            includeFontPadding: false
        },

        opcoes: {
            width: '100%',
            marginTop: 16,
            gap: 10
        },

        opcao: {
            width: '100%',
            minHeight: 58,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            borderRadius: 12
        },

        textoOpcao: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            fontWeight: '600',
            lineHeight: 22,
            includeFontPadding: false
        },

        indicador: {
            width: 23,
            height: 23,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: tema.cores.interface.textoSecundario,
            borderRadius: 12
        },

        indicadorAtivo: {
            backgroundColor: tema.cores.interface.destaque,
            borderColor: tema.cores.interface.destaque
        },

        indicadorParcial: {
            backgroundColor: 'transparent',
            borderColor: tema.cores.interface.textoSecundario
        },

        tracoParcial: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 19,
            textAlign: 'center',
            includeFontPadding: false
        },

        pressionado: {
            opacity: 0.72,
            transform: [{ scale: 0.99 }]
        },

        desabilitado: {
            opacity: 0.5
        }
    });
}

export { criarEstilos };
