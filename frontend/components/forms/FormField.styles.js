import { StyleSheet } from 'react-native';
import { cores, typography } from '../../theme';

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'stretch',
        alignItems: 'flex-start'
    },
    label: {
        ...typography.caption,
        color: cores.neutras.textoSecundarioClaro,
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
        ...typography.caption,
        color: cores.neutras.textoSecundarioClaro,
        marginTop: 8
    }
});

export { estilos };
/**
 * Define os estilos estruturais de rótulos e conteúdo do FormField.
 */
