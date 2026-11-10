//Define a estrutura visual da listagem da Rede de Apoio.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            flex: 1,
            minHeight: 0,
            backgroundColor: tema.cores.interface.fundo
        },

        apresentacao: {
            width: '100%',
            maxWidth: 350.011,
            alignSelf: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            paddingBottom: 20
        },

        descricao: {
            width: '100%',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 22.5,
            includeFontPadding: false
        },

        botaoLimpar: {
            width: '100%',
            maxWidth: 350.011,
            height: 35.99,
            flexShrink: 0,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: '#C85A44',
            borderRadius: 10
        },

        textoBotaoLimpar: {
            color: '#C85A44',
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 25.5,
            textAlign: 'center'
        },

        areaLista: {
            flex: 1,
            minHeight: 0
        },

        acaoPrincipal: {
            width: '100%',
            flexShrink: 0,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 18,
            borderTopWidth: 1,
            borderTopColor: tema.cores.interface.separador,
            backgroundColor: tema.cores.interface.fundo
        },

        botaoAdicionar: {
            width: '100%',
            height: 56,
            borderRadius: 12
        },

        textoBotaoAdicionar: {
            fontFamily: fontFamilies.semibold,
            fontSize: 17,
            fontWeight: '600',
            lineHeight: 24
        }
    });
}

export { criarEstilos };
