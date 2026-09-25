import { StyleSheet } from 'react-native';
import { cores, typography } from '../../../theme';

const estilos = StyleSheet.create({
    formulario: { gap: 20, paddingHorizontal: 24, paddingTop: 0, paddingBottom: 40 },
    campoSeletor: { height: 56, paddingHorizontal: 14, borderWidth: 0.705, borderColor: cores.neutras.bordaClara, borderRadius: 12, backgroundColor: cores.neutras.superficieClara, flexDirection: 'row', alignItems: 'center', gap: 12 },
    caixaIconeCampo: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    valorSeletor: { ...typography.bodyDefault, color: cores.neutras.textoPrincipalClaro, flex: 1 },
    placeholder: { color: cores.neutras.textoSecundarioClaro },
    pressionado: { opacity: 0.7 },
    telaFluxo: { flex: 1, backgroundColor: cores.neutras.fundoClaro },
    conteudoFluxo: { flex: 1, paddingHorizontal: 24, gap: 12 },
    descricaoFluxo: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 21, color: cores.neutras.textoSecundarioClaro, marginBottom: 8 },
    listaHorariosFluxo: { gap: 12 },
    acaoFixa: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 24 },
    opcoesIntensidade: { gap: 12 }
});

export { estilos };
