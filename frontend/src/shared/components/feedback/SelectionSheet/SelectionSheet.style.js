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
        textoOpcao: tema.escuro ? { color: '#FFFFFFDE' } : {},
        lista: {
            flexGrow: 0,
            marginHorizontal: -8,
            backgroundColor: tema.escuro ? '#242424' : tema.cores.interface.superficieElevada
        },

        conteudoLista: {
            paddingBottom: tema.espacamentos.pequeno
        },

        mensagemVazia: {
            ...tema.typography.bodyDefault,
            paddingVertical: tema.espacamentos.grande,
            color: tema.escuro ? '#FFFFFFDE' : tema.cores.interface.textoSecundario
        }
    });
}

export { criarEstilos };
