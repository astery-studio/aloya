//Define a lista, os estados e a ação fixa das categorias de permissão.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            flex: 1,
            alignSelf: 'stretch'
        },

        conteudo: {
            minHeight: 0,
            flex: 1
        },

        conteudoLista: {
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 24
        },

        separador: {
            height: 12
        },

        estadoCentral: {
            width: '100%',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 28,
            paddingVertical: 40
        },

        textoCarregamento: {
            marginTop: 14,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            lineHeight: 22
        },

        atualizacao: {
            minHeight: 38,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingBottom: 12
        },

        textoAtualizacao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 20
        },

        acaoFixa: {
            width: '100%',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
            backgroundColor: tema.cores.interface.fundo,
            borderTopWidth: 1,
            borderTopColor: tema.cores.interface.borda
        }
    });
}

export { criarEstilos };
