import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

function criarEstilos(tema) {
    const cores = obterCoresDiario(tema).interface;
    return StyleSheet.create({
        chip: {
            alignSelf: 'stretch',
            minHeight: 36,
            marginTop: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
        },
        carregando: { backgroundColor: cores.separador },
        texto: {
            flexShrink: 1,
            fontFamily: fontFamilies.semiBold,
            fontSize: 13,
            lineHeight: 18,
            textAlign: 'center'
        },
        textoCarregando: { color: cores.textoSecundario }
    });
}

export { criarEstilos };
