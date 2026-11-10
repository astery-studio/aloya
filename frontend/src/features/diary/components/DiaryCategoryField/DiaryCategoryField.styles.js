import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: { width: '100%', gap: 8 },
        faixaTitulo: {
            minHeight: 36,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 14,
            borderRadius: 10
        },
        titulo: {
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            lineHeight: 20,
            textAlign: 'center'
        },
        grupo: { width: '100%', gap: 8 },
        tituloGrupoLinha: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },
        linha: { flex: 1, height: 1, backgroundColor: tema.cores.interface.borda },
        tituloGrupo: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.semibold,
            fontSize: 11,
            lineHeight: 16,
            letterSpacing: 0.5
        },
        opcoes: {
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 5
        },
        contador: {
            alignSelf: 'flex-end',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 10,
            lineHeight: 19
        },
        erro: {
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18
        }
    });
}

export { criarEstilos };
