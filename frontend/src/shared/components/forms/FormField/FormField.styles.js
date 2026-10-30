/**
 * Define os estilos estruturais de rótulos e conteúdo do FormField.
 */
import { StyleSheet } from 'react-native';
function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            alignSelf: 'stretch',
            alignItems: 'flex-start'
        },
        label: {
            ...tema.typography.caption,
            color: tema.cores.interface.textoSecundario,
            lineHeight: 21,
            alignSelf: 'stretch'
        },
        labelSecao: { paddingLeft: 4 },
        conteudo: {
            width: '100%',
            paddingTop: 8,
            alignItems: 'flex-start'
        },
        mensagemAuxiliar: {
            ...tema.typography.caption,
            color: tema.cores.interface.textoSecundario,
            marginTop: 8
        }
    });
}

export { criarEstilos };
