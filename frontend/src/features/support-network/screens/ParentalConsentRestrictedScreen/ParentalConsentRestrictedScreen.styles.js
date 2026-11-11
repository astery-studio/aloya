import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 20,
            backgroundColor: tema.cores.interface.fundo
        },
        descricao: {
            width: '100%',
            maxWidth: 350,
            alignSelf: 'center',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            lineHeight: 22.5
        },
        cartao: {
            width: '100%',
            maxWidth: 350,
            alignSelf: 'center',
            marginTop: 86,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            borderRadius: 18,
            backgroundColor: tema.cores.neutras.superficieClara
        },
        cabecalhoCartao: {
            height: 166,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            backgroundColor: '#2C4C3B'
        },
        caixaIcone: {
            width: 64,
            height: 64,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            backgroundColor: 'rgba(255, 255, 255, 0.15)'
        },
        rotuloRestrito: {
            color: '#D8D4CC',
            fontFamily: fontFamilies.bold,
            fontSize: 13,
            fontWeight: '700',
            lineHeight: 19.5,
            letterSpacing: 1.2
        },
        conteudoCartao: {
            paddingHorizontal: 24,
            paddingTop: 26,
            paddingBottom: 28,
            alignItems: 'center'
        },
        tituloCartao: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 20,
            fontWeight: '700',
            lineHeight: 30,
            textAlign: 'center'
        },
        mensagemCartao: {
            marginTop: 12,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 24,
            textAlign: 'center'
        },
        botao: {
            height: 56,
            marginTop: 22,
            borderRadius: 12
        },
        atualizando: {
            marginTop: 16,
            alignItems: 'center'
        }
    });
}

export { criarEstilos };
