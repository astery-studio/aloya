import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        barra: {
            width: '100%',
            height: 78.17,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            backgroundColor: tema.escuro ? '#1E1E1E' : tema.cores.interface.superficie,
            borderTopWidth: 0.666667,
            borderTopColor: tema.escuro ? 'rgba(255, 255, 255, 0.12)' : tema.cores.interface.borda
        }
    });
}

export { criarEstilos };
