/**
 * Centraliza estilos compartilhados pelas telas de autenticação.
 */
import { StyleSheet } from 'react-native';
import { fontFamilies, typography } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        campos: { gap: 12, width: '100%' },
        link: {
            ...typography.caption,
            color: tema.escuro ? tema.cores.interface.destaque : tema.cores.marca.primaria,
            textAlign: 'center'
        },
        separador: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 12,
            width: '100%'
        },
        linha: { backgroundColor: tema.cores.interface.borda, flex: 1, height: 1 },
        legenda: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19.5
        },
        rodape: { gap: 24, width: '100%' }
    });
}

export { criarEstilos };
