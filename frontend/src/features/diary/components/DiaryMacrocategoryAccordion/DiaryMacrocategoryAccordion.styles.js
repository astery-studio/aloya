import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            overflow: 'hidden',
            borderWidth: 0.7,
            borderColor: tema.cores.interface.borda,
            borderRadius: 12,
            backgroundColor: tema.cores.interface.superficieElevada
        },
        containerFormulario: {
            maxWidth: 308,
            alignSelf: 'center',
            borderRadius: 14,
            backgroundColor: tema.cores.interface.superficie
        },
        expandido: { borderWidth: 1.41, borderRadius: 14 },
        cabecalho: {
            width: '100%',
            minHeight: 60,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            gap: 10
        },
        cabecalhoFormulario: { height: 60, paddingHorizontal: 14 },
        expansao: {
            minWidth: 0,
            minHeight: 44,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },
        caixaIcone: {
            width: 34,
            height: 34,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9
        },
        titulo: {
            minWidth: 0,
            flex: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            lineHeight: 21
        },
        conteudoFormulario: {
            width: '100%',
            gap: 16,
            paddingHorizontal: 6,
            paddingTop: 12,
            paddingBottom: 16,
            borderTopWidth: 1
        },
        desabilitado: { opacity: 0.5 },
        pressionado: { opacity: 0.72 }
    });
}

export { criarEstilos };
