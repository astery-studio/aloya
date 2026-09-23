import { StyleSheet } from 'react-native';
import { cores, espacamentos, typography } from '../../../theme';

const estilos = StyleSheet.create({
    navegacao: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 48,
        paddingHorizontal: espacamentos.grande
    },
    pular: {
        ...typography.caption,
        color: cores.neutras.textoPrincipalClaro
    },
    conteudo: {
        alignItems: 'center',
        gap: 40,
        width: '100%'
    },
    textos: {
        alignItems: 'center',
        gap: 12,
        maxWidth: 304
    },
    titulo: {
        ...typography.h1,
        color: cores.neutras.textoPrincipalClaro,
        textAlign: 'center'
    },
    descricao: {
        ...typography.bodyDefault,
        color: cores.neutras.textoSecundarioClaro,
        textAlign: 'center'
    },
    campo: { width: '100%' }
});

export { estilos };
/**
 * Define posicionamento do cabeçalho e conteúdo das etapas do cadastro.
 */
