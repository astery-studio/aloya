import { StyleSheet } from 'react-native';
import { cores, espacamentos, fontFamilies, typography } from '../../../shared/theme';

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.neutras.fundoClaro },
    areaRolagem: { flex: 1 },
    cabecalho: { width: '100%', minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: espacamentos.medio, paddingTop: espacamentos.extraGrande },
    titulo: { ...typography.h2, flexShrink: 1, color: cores.neutras.textoPrincipalClaro, fontWeight: '700', lineHeight: 28 },
    rolagem: { flexGrow: 1, paddingBottom: espacamentos.medio },
    carregando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    textoCarregando: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.regular, fontSize: 15, fontWeight: '400', lineHeight: 21 },
    navegacaoSegura: { flexShrink: 0, backgroundColor: cores.neutras.superficieClara }
});

export { estilos };
