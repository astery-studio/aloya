//Define os estilos compartilhados pelas telas do fluxo de anticoncepcionais.
import { StyleSheet } from 'react-native';
import { espacamentos, fontFamilies, typography } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    const interfaceTema = tema.cores.interface;
    return StyleSheet.create({
        tela: {
            flex: 1,
            backgroundColor: interfaceTema.fundo
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
            color: interfaceTema.textoPrincipal
        },

        textoVazio: {
            ...typography.bodyDefault,
            textAlign: 'center',
            color: interfaceTema.textoSecundario
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
            color: tema.escuro ? '#FF9B88' : tema.cores.feedback.erro,
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
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
