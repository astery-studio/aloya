import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius, typography } from '../../theme';

const estilos = StyleSheet.create({
    opcao: {
        width: '100%', minHeight: 64, paddingHorizontal: 16,
        paddingVertical: 10, borderRadius: radius.buttonAndInput,
        borderWidth: 1.41, borderColor: cores.neutras.bordaClara,
        backgroundColor: cores.neutras.superficieClara,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12
    },
    selecionada: { borderColor: cores.marca.secundaria, backgroundColor: '#F0F5F2' },
    textos: { flex: 1 },
    titulo: { ...typography.bodyDefault, color: cores.neutras.textoPrincipalClaro },
    tituloSelecionado: {
        color: cores.marca.secundaria,
        fontFamily: fontFamilies.semibold, fontWeight: '600'
    },
    descricao: {
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 19.5
    },
    indicador: {
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 1.41, borderColor: cores.neutras.bordaTracejada,
        alignItems: 'center', justifyContent: 'center'
    },
    indicadorSelecionado: {
        borderColor: cores.marca.secundaria,
        backgroundColor: cores.marca.secundaria
    },
    pressionado: { opacity: 0.65, transform: [{ scale: 0.98 }] },
    desativado: { opacity: 0.55 }
});

export { estilos };
