import { StyleSheet } from 'react-native';
import { cores, espacamentos, typography } from '../theme';

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: cores.neutras.fundoClaro
    },
    flexivel: { flex: 1 },
    rolagem: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingHorizontal: espacamentos.grande,
        paddingTop: espacamentos.extraGrande,
        paddingBottom: espacamentos.grande,
        gap: espacamentos.extraGrande
    },
    conteudo: {
        width: '100%',
        gap: espacamentos.extraGrande
    },
    cabecalho: { gap: espacamentos.pequeno },
    titulo: {
        ...typography.h1,
        color: cores.neutras.textoPrincipalClaro
    },
    descricao: {
        ...typography.bodyDefault,
        color: cores.neutras.textoSecundarioClaro
    },
    formulario: {
        width: '100%',
        gap: espacamentos.medio
    },
    rodape: {
        width: '100%',
        alignItems: 'center'
    }
});

export { estilos };
