import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';

function criarEstilos(tema) {
    const { textoPrincipal, textoSecundario } = tema.escuro
        ? coresNoturnasConteudo
        : tema.cores.interface;

    return StyleSheet.create({
        container: { width: '100%', alignItems: 'center', paddingHorizontal: 16 },
        boasVindas: { width: '100%', maxWidth: 358, alignItems: 'center', paddingTop: 34 },
        titulo: {
            width: '100%',
            maxWidth: 310,
            color: tema.escuro ? textoPrincipal : '#222222',
            fontFamily: fontFamilies.regular,
            fontSize: 25,
            lineHeight: 26.25,
            letterSpacing: -0.875,
            includeFontPadding: false,
            textAlign: 'center'
        },
        descricao: {
            width: '100%',
            maxWidth: 330,
            paddingTop: 13,
            color: tema.escuro ? textoSecundario : '#5C5C59',
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 20.8,
            includeFontPadding: false,
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
