import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.neutras.fundoClaro },
    cabecalho: { height: 102, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56 },
    titulo: { flex: 1, color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 28, paddingBottom: 9 },
    botaoCalendario: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: cores.neutras.superficieClara, borderWidth: 0.7, borderColor: cores.neutras.bordaClara },
    rolagem: { flexGrow: 1, paddingTop: 12 },
    carregando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    textoCarregando: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.regular, fontSize: 15 }
});

export { estilos };
