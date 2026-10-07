import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.neutras.fundoClaro },
    cabecalho: { width: '100%', height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16 },
    titulo: { color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 28 },
    rolagem: { flexGrow: 1, paddingBottom: 128 },
    carregando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    textoCarregando: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.regular, fontSize: 15 }
});

export { estilos };
