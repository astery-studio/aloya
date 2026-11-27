import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const { espacamentos, typography, radius } = tema;
    const cores = tema.cores.interface;
    const textoLeitura = {
        ...typography.caption,
        fontFamily: fontFamilies.regular,
        fontWeight: '400'
    };

    return StyleSheet.create({
        suporte: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: cores.borda,
            paddingTop: espacamentos.medio,
            gap: espacamentos.minimo
        },
        linha: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: espacamentos.pequeno
        },
        flexivel: { flex: 1, minWidth: 0 },
        acao: { minHeight: 48, justifyContent: 'center' },
        pressionado: { opacity: 0.72 },
        textoAcao: {
            ...typography.caption,
            fontFamily: fontFamilies.semibold,
            fontWeight: '600',
            color: cores.destaque,
            textDecorationLine: 'underline'
        },
        corpo: { ...textoLeitura, color: cores.textoPrincipal },
        meta: { ...typography.caption, color: cores.textoSecundario },
        chamada: {
            ...typography.bodyDefault,
            fontFamily: fontFamilies.semibold,
            fontWeight: '600',
            color: cores.textoPrincipal
        },
        copiar: {
            minWidth: 48,
            minHeight: 48,
            alignItems: 'flex-end',
            justifyContent: 'center'
        },
        avisoCopia: {
            position: 'absolute',
            bottom: 48 + espacamentos.minimo,
            right: 0,
            maxWidth: '100%',
            paddingHorizontal: espacamentos.medio,
            paddingVertical: espacamentos.pequeno,
            borderRadius: radius.medio,
            backgroundColor: cores.destaque
        },
        textoAvisoCopia: {
            ...typography.caption,
            color: cores.textoSobreDestaque
        }
    });
}

export { criarEstilos };
