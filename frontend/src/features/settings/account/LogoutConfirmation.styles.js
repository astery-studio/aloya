import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        icone: tema.escuro ? { borderRadius: 14 } : {},
        botaoSair: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#242424'
              }
            : {},
        textoSair: tema.escuro ? { color: '#E3E3E3' } : {},
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
