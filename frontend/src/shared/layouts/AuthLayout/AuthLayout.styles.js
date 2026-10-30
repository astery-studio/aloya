/**
 * Define a estrutura visual compartilhada pelas telas de autenticação.
 */
import { StyleSheet } from 'react-native';
import { espacamentos, typography } from '../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
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
            color: tema.cores.interface.textoPrincipal,
            textAlign: 'center'
        },
        descricao: {
            ...typography.bodyDefault,
            color: tema.cores.interface.textoSecundario,
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
}

export { criarEstilos };
