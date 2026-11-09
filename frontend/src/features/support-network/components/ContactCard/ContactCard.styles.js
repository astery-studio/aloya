import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        cartao: {
            width: '100%',
            overflow: 'hidden',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 18,
            gap: 14,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            borderRadius: 16
        },

        cartaoDesabilitado: {
            opacity: 0.68
        },

        cabecalho: {
            width: '100%',
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },

        nome: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 24,
            textAlign: 'center',
            includeFontPadding: false
        },

        acoesCompactas: {
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
        },

        divisor: {
            width: '100%',
            height: 1,
            backgroundColor: tema.cores.interface.separador
        },

        informacoes: {
            width: '100%',
            gap: 10
        },

        tituloSecao: {
            width: '100%',
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 0.7,
            textAlign: 'center',
            includeFontPadding: false
        },

        linhaInformacao: {
            width: '100%',
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
        },

        recuoInformacao: {
            minWidth: 0,
            paddingLeft: 24
        },

        iconeInformacao: {
            width: 16,
            flexShrink: 0,
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            lineHeight: 20,
            textAlign: 'center',
            includeFontPadding: false
        },

        textoInformacao: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            includeFontPadding: false
        },

        rotuloInformacao: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.medium,
            fontWeight: '500'
        },

        textoEspera: {
            minWidth: 0,
            flex: 1,
            color: tema.escuro ? '#8FC3DD' : '#4A758E',
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 21,
            includeFontPadding: false
        },

        estado: {
            width: '100%',
            alignItems: 'center'
        },

        acoesRecebidas: {
            width: '100%'
        },

        linhaAcoesRecebidas: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },

        acaoRecebida: {
            minWidth: 0,
            flex: 1
        },

        botaoRecebido: {
            width: '100%',
            minHeight: 52
        },

        botaoResumo: {
            width: '100%',
            minHeight: 52
        }
    });
}

export { criarEstilos };
