import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        botaoSairSemSalvar: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#242424'
              }
            : {},
        textoSairSemSalvar: tema.escuro ? { color: '#E3E3E3' } : {},
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
