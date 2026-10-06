import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.neutras.fundoClaro },
    cabecalho: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12 },
    titulo: { flex: 1, color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold, fontSize: 20, lineHeight: 25 },
    botaoCalendario: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: cores.neutras.superficieClara, borderWidth: 1, borderColor: cores.neutras.bordaClara },
    rolagem: { flexGrow: 1 },
    carregando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    textoCarregando: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.regular, fontSize: 15 }
});

export { estilos };
