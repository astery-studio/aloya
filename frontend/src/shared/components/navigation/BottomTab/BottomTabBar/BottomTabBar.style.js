import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        barra: {
            width: '100%',
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: tema.escuro ? '#1E1E1E' : '#FFFFFF',
            borderTopWidth: 0.667,
            borderTopColor: tema.escuro ? 'rgba(255, 255, 255, 0.12)' : '#E6E2D8'
        }
    });
}

export { criarEstilos };
