/**
 * Centraliza os estilos e variantes dos campos textuais reutilizáveis.
 */
import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius, typography } from '../../theme';

const estilos = StyleSheet.create({
    container: {
        width: '100%', height: 60, borderRadius: radius.buttonAndInput,
        borderWidth: 1.41, borderColor: cores.neutras.bordaClara,
        backgroundColor: cores.neutras.superficieClara,
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16
    },
    preenchido: { borderColor: '#C8B8AD' },
    conteudo: { flex: 1, justifyContent: 'center' },
    rotuloFlutuante: {
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.semibold, fontSize: 11,
        fontWeight: '600', lineHeight: 16.5,
        letterSpacing: 0.55, textTransform: 'uppercase'
    },
    entrada: {
        ...typography.bodyDefault, color: cores.neutras.textoPrincipalClaro,
        padding: 0, minHeight: 24
    },
    categoria: { height: 56, borderWidth: 0.705 },
    popup: { height: 52, backgroundColor: '#FAFAF8' },
    desativado: { opacity: 0.55 },
    acao: { padding: 8, marginRight: -8 },
    rotuloExterno: { ...typography.caption, color: cores.neutras.textoSecundarioClaro },
    grupo: { width: '100%', gap: 8 }
});

export { estilos };
