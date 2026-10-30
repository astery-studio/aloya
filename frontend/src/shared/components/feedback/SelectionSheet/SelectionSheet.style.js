import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        lista: {
            flexGrow: 0,
            marginHorizontal: -8,
            backgroundColor: tema.cores.interface.superficieElevada
        },

        conteudoLista: {
            paddingBottom: tema.espacamentos.pequeno
        },

        mensagemVazia: {
            ...tema.typography.bodyDefault,
            paddingVertical: tema.espacamentos.grande,
            color: tema.cores.interface.textoSecundario
        }
    });
}

export { criarEstilos };
