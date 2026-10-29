import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        tela: {
            flex: 1,
            justifyContent: 'flex-end'
        },

        fundo: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: tema.cores.interface.sobreposicao
        },

        painel: {
            maxHeight: '90%',
            paddingBottom: tema.espacamentos.grande,
            backgroundColor: tema.cores.interface.superficieElevada,
            borderTopLeftRadius: tema.radius.bottomSheet,
            borderTopRightRadius: tema.radius.bottomSheet,
            ...tema.shadows.sheet
        }
    });
}

export { criarEstilos };
