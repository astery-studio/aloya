import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const { textoPrincipal, textoSecundario } = tema.cores.interface;

    return StyleSheet.create({
        container: { width: '100%', alignItems: 'center', paddingHorizontal: 24 },
        titulo: {
            color: textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 24,
            lineHeight: 30,
            textAlign: 'center'
        },
        descricao: {
            maxWidth: 350,
            marginTop: 12,
            color: textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 21,
            textAlign: 'center'
        },
        areaArte: { alignItems: 'center', marginTop: 16, maxWidth: '100%' },
        arteSemCiclo: { width: 260, maxWidth: '100%', aspectRatio: 1 },
        fase: {
            marginTop: 12,
            color: textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 28,
            lineHeight: 35,
            textAlign: 'center'
        },
        dia: {
            marginTop: 4,
            color: textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            lineHeight: 24,
            textAlign: 'center'
        }
    });
}

export { criarEstilos };
