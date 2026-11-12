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
            overflow: 'hidden',
            paddingBottom: tema.espacamentos.grande,
            backgroundColor: tema.cores.interface.superficieElevada,
            borderTopLeftRadius: tema.radius.bottomSheet,
            borderTopRightRadius: tema.radius.bottomSheet,
            ...tema.shadows.sheet
        },

        areaArraste: {
            width: '100%',
            height: 28,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center'
        },

        alcaArraste: {
            width: 44,
            height: 4,
            borderRadius: 2,
            backgroundColor: tema.cores.interface.borda
        }
    });
}

export { criarEstilos };
