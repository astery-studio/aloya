import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const { espacamentos, radius, typography } = tema;
    const cores = tema.cores.interface;
    const semibold = { fontFamily: fontFamilies.semibold, fontWeight: '600' };

    return StyleSheet.create({
        secao: {
            borderRadius: radius.grande,
            backgroundColor: cores.superficie,
            borderWidth: 1,
            borderColor: cores.borda
        },
        aberta: { borderColor: cores.destaque },
        cabecalho: {
            minHeight: 48,
            paddingHorizontal: espacamentos.medio,
            paddingVertical: espacamentos.pequeno,
            flexDirection: 'row',
            alignItems: 'center',
            gap: espacamentos.pequeno
        },
        pressionado: { opacity: 0.72 },
        numero: { ...typography.caption, color: cores.textoSecundario },
        titulo: {
            ...typography.bodyDefault,
            ...semibold,
            color: cores.textoPrincipal,
            flex: 1,
            minWidth: 0
        },
        corpo: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: cores.borda,
            padding: espacamentos.medio,
            gap: espacamentos.medio
        },
        paragrafo: {
            ...typography.caption,
            fontFamily: fontFamilies.regular,
            fontWeight: '400',
            color: cores.textoPrincipal
        },
        enfase: semibold
    });
}

export { criarEstilos };
