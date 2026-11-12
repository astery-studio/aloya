import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: { width: '100%', gap: 14, paddingBottom: 20 },
        botaoLimpar: {
            width: '100%',
            height: 44,
            borderWidth: 1.41,
            borderColor: tema.cores.marca.primaria,
            borderRadius: 12,
            backgroundColor: 'transparent'
        },
        textoLimpar: { color: tema.cores.marca.primaria, fontFamily: fontFamilies.semibold },
        lista: { gap: 8, paddingHorizontal: 8 },
        divisor: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
        linha: { flex: 1, height: 1, backgroundColor: tema.cores.interface.borda },
        textoDivisor: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 0.72
        }
    });
}

export { criarEstilos };
