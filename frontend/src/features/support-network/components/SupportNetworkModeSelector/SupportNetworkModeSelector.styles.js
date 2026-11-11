import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            maxWidth: 350.01,
            paddingBottom: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16
        },
        containerOpcao: {
            minWidth: 0,
            height: 30,
            paddingHorizontal: 5,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
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
            width: '100%',
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
