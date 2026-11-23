//Define a organização visual do modal de filtros de contatos.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        modal: {
            width: '100%',
            maxWidth: 342,
            borderRadius: 24
        },

        conteudo: {
            width: '100%',
            alignItems: 'center',
            gap: 26
        },

        secao: {
            width: '100%',
            alignItems: 'center',
            gap: 14
        },

        tituloSecao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 11,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 16.5,
            letterSpacing: 0.66,
            textAlign: 'center',
            textTransform: 'uppercase',
            includeFontPadding: false
        },

        chips: {
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: 12,
            rowGap: 10
        },

        rolagemPermissoes: {
            width: '100%',
            maxHeight: 150,
            flexGrow: 0
        },

        acoes: {
            width: '100%',
            gap: 14
        },

        botaoLimpar: {
            width: '100%',
            height: 56,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.destaque,
            borderRadius: 12,
            backgroundColor: tema.cores.interface.superficieElevada
        },

        textoBotaoLimpar: {
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.regular,
            fontSize: 18,
            fontWeight: '400',
            lineHeight: 27
        },

        botaoAplicar: {
            width: '100%',
            height: 56,
            borderRadius: 12,
            backgroundColor: tema.cores.interface.destaque
        },

        textoBotaoAplicar: {
            color: tema.cores.interface.textoSobreDestaque,
            fontFamily: fontFamilies.regular,
            fontSize: 18,
            fontWeight: '400',
            lineHeight: 27
        }
    });
}

export { criarEstilos };
