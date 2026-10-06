import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius, shadows } from '../../../shared/theme';

const estilos = StyleSheet.create({
    fundo: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, backgroundColor: 'rgba(34, 34, 34, 0.45)' },
    caixa: { width: '100%', maxWidth: 342, minHeight: 327, alignItems: 'center', gap: 16, paddingTop: 32, paddingHorizontal: 24, paddingBottom: 24, backgroundColor: cores.neutras.superficieClara, borderRadius: radius.popup, ...shadows.popup },
    areaIcone: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDEDED', borderRadius: 14 },
    textos: { width: '100%', alignItems: 'center' },
    titulo: { color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold, fontSize: 17, lineHeight: 22, textAlign: 'center' },
    mensagem: { paddingTop: 8, color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 21, textAlign: 'center' },
    acoes: { width: '100%', gap: 10, paddingTop: 4 }
});

export { estilos };
