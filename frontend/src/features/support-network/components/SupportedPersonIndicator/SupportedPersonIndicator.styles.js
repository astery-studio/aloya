import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const cores = tema.cores.interface;

    return StyleSheet.create({
        container: {
            alignSelf: 'center',
            maxWidth: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: 8,
            rowGap: 2,
            paddingHorizontal: 13,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 0.667,
            borderColor: tema.escuro ? cores.borda : '#E6E2D8',
            backgroundColor: tema.escuro ? cores.superficie : 'rgba(255, 255, 255, 0.72)'
        },
        rotulo: {
            flexShrink: 1,
            color: tema.escuro ? cores.textoSecundario : '#847F76',
            fontFamily: fontFamilies.regular,
            fontSize: 8,
            lineHeight: 12,
            textAlign: 'center',
            textTransform: 'uppercase',
            includeFontPadding: false
        },
        nome: {
            flexShrink: 1,
            color: tema.escuro ? cores.textoPrincipal : '#222222',
            fontFamily: fontFamilies.bold,
            fontSize: 11,
            lineHeight: 16.5,
            textAlign: 'center',
            includeFontPadding: false
        }
    });
}

export { criarEstilos };
