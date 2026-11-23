import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

function criarEstilos(tema) {
    const cores = obterCoresDiario(tema).interface;
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
            borderColor: '#C85A44',
            borderRadius: 10
        },
        textoLimpar: {
            color: '#C85A44',
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 25.5,
            textAlign: 'center'
        },
        lista: { gap: 8, paddingHorizontal: 8 },
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
