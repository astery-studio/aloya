import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            overflow: 'hidden',
            borderWidth: 0.7,
            borderColor: tema.cores.interface.borda,
            borderRadius: 14,
            backgroundColor: tema.cores.interface.superficie
        },
        cabecalho: {
            minHeight: 60,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 14
        },
        caixaIcone: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9
        },
        titulo: {
            flex: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            lineHeight: 21
        },
        conteudo: {
            width: '100%',
            gap: 16,
            paddingHorizontal: 10,
            paddingTop: 12,
            paddingBottom: 16,
            borderTopWidth: 1
        },
        desabilitado: { opacity: 0.5 },
        pressionado: { opacity: 0.72 }
    });
}

export { criarEstilos };
