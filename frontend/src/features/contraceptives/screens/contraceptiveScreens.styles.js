//Define os estilos compartilhados pelas telas do fluxo de anticoncepcionais.
import { StyleSheet } from 'react-native';
import { cores, espacamentos, fontFamilies, typography } from '../../../shared/theme';

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: cores.neutras.fundoClaro
    },

    conteudoFormulario: {
        paddingBottom: espacamentos.grande
    },

    lista: {
        flexGrow: 1,
        padding: espacamentos.grande
    },

    separador: {
        height: espacamentos.medio
    },

    vazio: {
        flex: 1,
        minHeight: 280,
        justifyContent: 'center',
        alignItems: 'center',
        gap: espacamentos.pequeno,
        paddingHorizontal: espacamentos.grande
    },

    tituloVazio: {
        ...typography.h2,
        textAlign: 'center',
        color: cores.neutras.textoPrincipalClaro
    },

    textoVazio: {
        ...typography.bodyDefault,
        textAlign: 'center',
        color: cores.neutras.textoSecundarioClaro
    },

    acao: {
        marginTop: espacamentos.grande
    },

    acaoExcluir: {
        minHeight: 44,
        marginTop: -16,
        marginHorizontal: espacamentos.grande,
        marginBottom: espacamentos.grande,
        alignItems: 'center',
        justifyContent: 'center'
    },

    textoExcluir: {
        color: cores.feedback.erro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center',
        textDecorationLine: 'underline'
    },

    acaoPressionada: {
        opacity: 0.6
    },

    acaoDesabilitada: {
        opacity: 0.4
    }
});

export { estilos };