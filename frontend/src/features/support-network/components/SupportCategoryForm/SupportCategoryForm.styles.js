//Define a organização visual do formulário de criação de categoria.
import { StyleSheet } from 'react-native';

function criarEstilos(tema, aparenciaNovaCategoria = false) {
    return StyleSheet.create({
        campoNome:
            tema.escuro && aparenciaNovaCategoria
                ? { borderColor: '#3C3C3C', backgroundColor: '#1E1E1E' }
                : {},
        container: {
            width: '100%',
            alignSelf: 'stretch'
        },

        conteudo: {
            width: '100%',
            gap: 32
        },

        acao: {
            width: '100%',
            paddingTop: 32,
            paddingBottom: 16
        }
    });
}

const estilos = criarEstilos({ escuro: false });

export { criarEstilos, estilos };
