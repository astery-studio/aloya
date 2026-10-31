import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        painel: tema.escuro
            ? {
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  boxShadow: '0 -4px 32px 0 rgba(34, 34, 34, 0.10)'
              }
            : {},
        caixaCampo: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 1.41,
                  borderColor: '#A5D6A7',
                  backgroundColor: '#2C2C2C'
              }
            : {},
        textoCampo: tema.escuro ? { color: '#999999' } : {},
        botaoSalvarDesativado: tema.escuro ? { borderRadius: 12, backgroundColor: '#2C2C2C' } : {},
        textoSalvarDesativado: tema.escuro ? { color: '#757575' } : {}
    });
}

export { criarEstilos };
