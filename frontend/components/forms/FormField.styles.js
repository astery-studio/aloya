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
    labelComRecuo: { paddingLeft: 4 },
    labelConta: { lineHeight: 19.6 },
    conteudo: {
        width: '100%',
        paddingTop: 8,
        alignItems: 'flex-start'
    },
    conteudoPerfil: { gap: 8 },
    mensagemAuxiliar: {
        ...typography.caption,
        color: cores.neutras.textoSecundarioClaro,
        marginTop: 8
    }
});

export { estilos };
