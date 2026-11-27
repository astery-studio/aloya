import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const cores = tema.cores.interface;

    return StyleSheet.create({
        container: {
            alignSelf: 'center',
            maxWidth: '100%',
            minHeight: 34,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: 8,
            rowGap: 2,
            paddingHorizontal: 13,
            paddingVertical: 7,
            borderRadius: 99,
            borderWidth: 0.7,
            borderColor: cores.borda,
            backgroundColor: cores.superficie
        },
        rotulo: {
            flexShrink: 1,
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 8,
            lineHeight: 12,
            textAlign: 'center',
            textTransform: 'uppercase',
            includeFontPadding: false
        },
        nome: {
            flexShrink: 1,
            color: cores.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 11,
            lineHeight: 16,
            textAlign: 'center',
            includeFontPadding: false
        }
    });
}

export { criarEstilos };
