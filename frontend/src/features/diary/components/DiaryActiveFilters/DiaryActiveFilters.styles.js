import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

function criarEstilos(tema) {
    const diario = obterCoresDiario(tema);
    const cores = diario.interface;
    const coral = tema.escuro ? diario.primaria : '#C85A44';
    return StyleSheet.create({
        container: { width: '100%', gap: 14, paddingBottom: 20 },
        botaoLimpar: {
            width: '100%',
            maxWidth: 350.011,
            height: 35.99,
            flexShrink: 0,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: coral,
            borderRadius: 10,
            backgroundColor: 'transparent'
        },
        textoLimpar: {
            color: coral,
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 25.5,
            textAlign: 'center'
        },
        lista: { paddingHorizontal: 3 },
        containerTag: {
            height: 30,
            paddingHorizontal: 5,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10
        },
        tag: {
            minHeight: 0,
            alignSelf: 'stretch',
            justifyContent: 'center',
            paddingVertical: 3,
            paddingHorizontal: 8,
            gap: 3,
            borderWidth: 0.7,
            borderColor: coral,
            borderRadius: 99,
            backgroundColor: 'transparent'
        },
        textoTag: {
            color: coral,
            fontFamily: fontFamilies.semibold,
            fontSize: 11,
            fontWeight: '600',
            lineHeight: 16.5
        },
        divisor: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
        linha: { flex: 1, height: 1, backgroundColor: cores.borda },
        textoDivisor: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 0.72
        }
    });
}

export { criarEstilos };
