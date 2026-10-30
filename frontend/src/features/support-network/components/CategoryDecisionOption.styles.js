import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

const COR_PERIGO = '#BD3E3E';

function criarEstilos(tema) {
    const corPerigo = tema.escuro ? '#FF9A9A' : COR_PERIGO;

    return StyleSheet.create({
        opcao: {
            width: '100%',
            minHeight: 64,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: 1.4,
            borderColor: tema.cores.interface.borda,
            borderRadius: tema.radius.buttonAndInput,
            backgroundColor: tema.cores.interface.superficie,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
        },

        opcaoSelecionadaPerigo: {
            borderColor: corPerigo
        },

        opcaoSelecionadaManter: {
            borderColor: tema.cores.interface.destaque
        },

        fundoPerigo: {
            backgroundColor: tema.escuro ? '#3B2525' : '#FDF0F0'
        },

        fundoManter: {
            backgroundColor: tema.cores.interface.destaqueSuave
        },

        textos: {
            flex: 1,
            gap: 2
        },

        indicador: {
            width: 22,
            height: 22,
            flexShrink: 0,
            borderRadius: 11,
            borderWidth: 1.5,
            borderColor: tema.cores.interface.borda,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.cores.interface.superficie
        },

        indicadorPerigo: {
            borderColor: corPerigo,
            backgroundColor: corPerigo
        },

        indicadorManter: {
            borderColor: tema.cores.interface.destaque,
            backgroundColor: tema.cores.interface.destaque
        },

        centroIndicador: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: tema.cores.interface.textoSobreDestaque
        },

        titulo: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 20
        },

        tituloPerigo: {
            color: corPerigo,
            fontFamily: fontFamilies.semibold,
            fontWeight: '600'
        },

        tituloManter: {
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.semibold,
            fontWeight: '600'
        },

        descricao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 19
        },

        pressionada: {
            opacity: 0.7,
            transform: [
                {
                    scale: 0.99
                }
            ]
        },

        desabilitada: {
            opacity: 0.5
        }
    });
}

export { COR_PERIGO, criarEstilos };
