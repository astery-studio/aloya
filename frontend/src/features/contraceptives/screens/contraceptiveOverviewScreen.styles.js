import { StyleSheet } from 'react-native';
import { cores, espacamentos, typography } from '../../../shared/theme';

const estilosVisaoGeral = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.neutras.fundoClaro },
    conteudo: { flex: 1 },
    lista: { flexGrow: 1, width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: espacamentos.grande, gap: espacamentos.medio },
    separador: { height: espacamentos.medio },
    estado: { flex: 1, minHeight: 280, justifyContent: 'center', alignItems: 'center', gap: espacamentos.pequeno, paddingHorizontal: espacamentos.grande },
    tituloEstado: { ...typography.h2, textAlign: 'center', color: cores.neutras.textoPrincipalClaro },
    textoEstado: { ...typography.bodyDefault, textAlign: 'center', color: cores.neutras.textoSecundarioClaro },
    acaoFixa: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, paddingHorizontal: espacamentos.grande, backgroundColor: cores.neutras.fundoClaro }
});

export { estilosVisaoGeral };
