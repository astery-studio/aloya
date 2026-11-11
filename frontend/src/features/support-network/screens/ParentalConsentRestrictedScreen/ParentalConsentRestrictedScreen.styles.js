import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        rolagem: {
            flex: 1,
            backgroundColor: tema.cores.interface.fundo
        },
        container: {
            flexGrow: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingHorizontal: 24,
            paddingTop: 115.3,
            paddingBottom: 24
        },
        cartao: {
            width: '100%',
            maxWidth: 342,
            alignSelf: 'center',
            overflow: 'hidden',
            borderWidth: 0.7,
            borderColor: tema.escuro ? tema.cores.interface.borda : '#E6E2D8',
            borderRadius: 20,
            backgroundColor: tema.cores.interface.superficie
        },
        cabecalhoCartao: {
            width: '100%',
            paddingTop: 28,
            paddingHorizontal: 24,
            paddingBottom: 20,
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#2C4C3B'
        },
        caixaIcone: {
            width: 52,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 26,
            backgroundColor: 'rgba(255, 255, 255, 0.12)'
        },
        rotuloRestrito: {
            color: 'rgba(255, 255, 255, 0.70)',
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19.5,
            letterSpacing: 0.78,
            textTransform: 'uppercase'
        },
        conteudoCartao: {
            width: '100%',
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 28,
            alignItems: 'center',
            gap: 20
        },
        blocoTexto: {
            width: '100%',
            alignItems: 'center'
        },
        containerTitulo: {
            width: '100%',
            alignItems: 'center'
        },
        tituloCartao: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 17,
            fontWeight: '700',
            lineHeight: 22.1,
            textAlign: 'center'
        },
        containerMensagem: {
            width: '100%',
            paddingTop: 10,
            alignItems: 'center'
        },
        mensagemCartao: {
            width: '100%',
            maxWidth: 294,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21.7,
            textAlign: 'center'
        },
        botao: {
            width: '100%',
            maxWidth: 294,
            height: 52,
            borderRadius: 12
        },
        textoBotao: {
            color: '#FFFFFF',
            fontFamily: fontFamilies.medium,
            fontSize: 16,
            fontWeight: '500',
            lineHeight: 24,
            textAlign: 'center'
        },
        atualizando: {
            marginTop: 16,
            alignItems: 'center'
        }
    });
}

export { criarEstilos };
