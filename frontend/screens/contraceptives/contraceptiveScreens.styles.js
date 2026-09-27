import { StyleSheet } from 'react-native';
import { cores, espacamentos, typography } from '../../theme';

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.neutras.fundoClaro },
    conteudoFormulario: { paddingBottom: espacamentos.grande },
    lista: { flexGrow: 1, padding: espacamentos.grande },
    separador: { height: espacamentos.medio },
    vazio: { flex: 1, minHeight: 280, justifyContent: 'center', alignItems: 'center', gap: espacamentos.pequeno },
    tituloVazio: { ...typography.h2, textAlign: 'center', color: cores.neutras.textoPrincipalClaro },
    textoVazio: { ...typography.bodyDefault, textAlign: 'center', color: cores.neutras.textoSecundarioClaro },
    acao: { marginTop: espacamentos.grande }
});

export { estilos };
