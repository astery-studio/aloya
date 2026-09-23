/**
 * Define a estrutura visual compartilhada pelas telas de autenticação.
 */
import { StyleSheet } from 'react-native';
import { cores, espacamentos, typography } from '../theme';

const estilos = StyleSheet.create({
    tela: {
        flex: 1
    },
    flexivel: { flex: 1 },
    rolagem: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: espacamentos.grande,
        paddingTop: espacamentos.extraGrande,
        paddingBottom: espacamentos.grande,
        gap: espacamentos.extraGrande
    },
    conteudo: {
        width: '100%',
        gap: espacamentos.extraGrande
    },
    voltar: { position: 'absolute', left: 24, top: 24, zIndex: 1 },
    cabecalho: { alignItems: 'center', gap: espacamentos.pequeno },
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
