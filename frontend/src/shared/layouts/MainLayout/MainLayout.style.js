// Define a estrutura visual do layout principal das telas internas.
import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: tema.cores.interface.fundo
        },

        conteudo: {
            flex: 1,
            minHeight: 0,
            backgroundColor: tema.cores.interface.fundo
        },

        navegacaoSegura: {
            width: '100%',
            flexShrink: 0,
            backgroundColor: tema.cores.interface.superficieElevada
        }
    });
}

export { criarEstilos };
