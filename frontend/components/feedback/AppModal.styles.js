import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius, shadows } from '../../theme';

const estilos = StyleSheet.create({
    fundo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: 'rgba(34, 34, 34, 0.45)'
    },
    caixa: {
        width: '100%',
        maxWidth: 342,
        paddingTop: 32,
        paddingHorizontal: 24,
        paddingBottom: 24,
        alignItems: 'center',
        gap: 16,
        borderRadius: radius.popup,
        backgroundColor: cores.neutras.superficieClara,
        ...shadows.popup
    },
    areaIcone: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5EDE3'
    },
    textos: { width: '100%', alignItems: 'center' },
    titulo: {
        color: cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 22.1,
        textAlign: 'center'
    },
    mensagem: {
        paddingTop: 8,
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center'
    },
    acoes: { width: '100%', gap: 10, paddingTop: 4 }
});

export { estilos };
