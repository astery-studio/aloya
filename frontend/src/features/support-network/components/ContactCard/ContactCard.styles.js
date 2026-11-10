import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        cartao: {
            width: '100%',
            maxWidth: 350,
            alignSelf: 'center',
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingHorizontal: 17.4,
            paddingTop: 16,
            paddingBottom: 17,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 0.705,
            borderColor: tema.cores.interface.borda,
            borderRadius: 16
        },

        cartaoDesabilitado: {
            opacity: 0.68
        },

        cabecalho: {
            width: '100%',
            minHeight: 36,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },

        identidade: {
            minWidth: 0,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },

        nome: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 16,
            fontWeight: '700',
            lineHeight: 24,
            includeFontPadding: false
        },

        acoesCompactas: {
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 4
        },

        informacoes: {
            width: '100%',
            marginTop: 14,
            paddingTop: 10,
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 12,
            borderTopWidth: 0.705,
            borderTopColor: tema.escuro ? tema.cores.interface.separador : '#F0EDE7'
        },

        containerTituloSecao: {
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        },

        tituloSecao: {
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.bold,
            fontSize: 10,
            fontWeight: '700',
            lineHeight: 15,
            letterSpacing: 0.6,
            textAlign: 'center',
            textTransform: 'uppercase',
            includeFontPadding: false
        },

        caixaInformacoes: {
            alignSelf: 'stretch',
            paddingVertical: 6,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 10
        },

        linhaInformacao: {
            width: '100%',
            minWidth: 0,
            height: 21,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
        },

        textoInformacao: {
            minWidth: 0,
            flex: 1,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            includeFontPadding: false
        },

        rotuloInformacao: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.medium,
            fontWeight: '500'
        },

        valorInformacao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontWeight: '400'
        },

        containerTituloPendente: {
            alignSelf: 'stretch',
            paddingTop: 10,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        },

        tituloPendente: {
            color: tema.escuro ? '#E4B15F' : '#B07D2A',
            fontFamily: fontFamilies.bold,
            fontSize: 10,
            fontWeight: '700',
            lineHeight: 15,
            letterSpacing: 0.6,
            textAlign: 'center',
            textTransform: 'uppercase',
            includeFontPadding: false
        },

        estado: {
            width: '100%',
            paddingTop: 10,
            alignItems: 'center'
        },

        acoesRecebidas: {
            width: '100%'
        },

        linhaAcoesRecebidas: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10
        },

        acaoRecebida: {
            minWidth: 0,
            height: 56,
            paddingTop: 8,
            paddingBottom: 6,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center'
        },

        botaoRecebido: {
            height: 36,
            minHeight: 36,
            flex: 1,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: '#2C4C3B'
        },

        botaoResumo: {
            width: '100%',
            height: 36,
            minHeight: 36,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: '#C85A44'
        },

        textoBotao: {
            color: '#FFFFFF',
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19.5,
            textAlign: 'center',
            includeFontPadding: false
        }
    });
}

export { criarEstilos };
