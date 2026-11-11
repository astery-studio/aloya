import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            maxWidth: 350.01,
            paddingBottom: 20
        },
        conteudo: {
            minWidth: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },
        conteudoCompacto: {
            gap: 5
        },
        containerOpcao: {
            height: 30,
            paddingHorizontal: 5,
            flexGrow: 1,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center'
        },
        opcaoApoio: {
            minWidth: 140
        },
        opcaoAcompanhados: {
            minWidth: 200
        },
        botao: {
            width: '100%',
            minHeight: 30,
            paddingVertical: 3,
            paddingHorizontal: 8,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            borderWidth: 0.7,
            borderColor: '#E6E2D8',
            borderRadius: 99
        },
        botaoSelecionado: {
            backgroundColor: '#C85A44'
        },
        botaoNaoSelecionado: {
            backgroundColor: '#F0EDE7'
        },
        botaoPressionado: {
            opacity: 0.72
        },
        texto: {
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19.5,
            textAlign: 'center',
            includeFontPadding: false
        },
        textoSelecionado: {
            color: '#FFFFFF'
        },
        textoNaoSelecionado: {
            color: tema.cores.interface.textoSecundario
        }
    });
}

export { criarEstilos };
