import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        barra: {
            width: '100%',
            height: 91,
            flexDirection: 'row',
            backgroundColor: tema.cores.interface.superficie,
            borderTopWidth: 1,
            borderTopColor: tema.cores.interface.borda
        }
    });
}

export { criarEstilos };
