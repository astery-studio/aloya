import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        caixa: tema.escuro
            ? {
                  borderRadius: 20,
                  backgroundColor: '#1E1E1E',
                  boxShadow: '0 8px 40px 0 rgba(34, 34, 34, 0.12)'
              }
            : {}
    });
}

export { criarEstilos };
