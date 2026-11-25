import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        barra: {
            width: '100%',
            height: 91,
            flexDirection: 'row',
            backgroundColor: tema.escuro ? '#1E1E1E' : tema.cores.interface.superficie,
            borderTopWidth: tema.escuro ? 0.667 : 1,
            borderTopColor: tema.escuro ? 'rgba(255, 255, 255, 0.12)' : tema.cores.interface.borda
        }
    });
}

export { criarEstilos };
