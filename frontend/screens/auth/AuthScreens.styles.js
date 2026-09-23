/**
 * Centraliza estilos compartilhados pelas telas de autenticação.
 */
import { StyleSheet } from 'react-native';
import { cores, fontFamilies, typography } from '../../theme';

const estilos = StyleSheet.create({
    campos: { gap: 12, width: '100%' },
    link: {
        ...typography.caption,
        color: cores.marca.primaria,
        textAlign: 'center'
    },
    separador: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        width: '100%'
    },
    linha: { backgroundColor: cores.neutras.bordaClara, flex: 1, height: 1 },
    legenda: {
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        lineHeight: 19.5
    },
    rodape: { gap: 24, width: '100%' }
});

export { estilos };
