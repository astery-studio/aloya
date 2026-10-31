import { StyleSheet } from 'react-native';

function criarEstilosErro(tema) {
    return StyleSheet.create({
        botao: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.38)',
                  backgroundColor: 'rgba(255, 255, 255, 0.16)'
              }
            : {},
        mensagem: tema.escuro ? { color: '#99999999' } : {},
        textoBotao: tema.escuro ? { color: '#FFFFFF' } : {}
    });
}

export { criarEstilosErro };
