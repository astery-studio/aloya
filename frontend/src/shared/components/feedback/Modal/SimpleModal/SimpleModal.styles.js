import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        caixa: tema.escuro
            ? {
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#333333'
              }
            : {},
        icone: tema.escuro ? { borderRadius: 14 } : {}
    });
}

export { criarEstilos };
