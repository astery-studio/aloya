//Define a estrutura visual da tela de categorias de permissão.
import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        tela: {
            flex: 1,
            width: '100%',
            backgroundColor: tema.cores.interface.fundo
        }
    });
}

export { criarEstilos };
