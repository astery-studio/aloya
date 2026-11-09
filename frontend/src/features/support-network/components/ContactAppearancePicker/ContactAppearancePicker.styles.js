//Define a apresentação das opções de ícone e cor do contato.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            gap: 28
        },

        secao: {
            width: '100%',
            gap: 14
        },

        titulo: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 15,
            fontWeight: '500',
            lineHeight: 22,
            includeFontPadding: false
        },

        gradeIcones: {
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            rowGap: 16
        },

        opcaoIcone: {
            width: 36,
            height: 36,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            borderRadius: 10
        },

        opcaoIconeSelecionada: {
            backgroundColor: tema.cores.interface.destaque,
            borderColor: tema.cores.interface.destaque
        },

        gradeCores: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },

        opcaoCor: {
            width: 36,
            height: 36,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderRadius: 10
        },

        opcaoCorSelecionada: {
            borderWidth: 2
        },

        opcaoPressionada: {
            opacity: 0.72,
            transform: [{ scale: 0.96 }]
        },

        opcaoDesabilitada: {
            opacity: 0.46
        }
    });
}

export { criarEstilos };
