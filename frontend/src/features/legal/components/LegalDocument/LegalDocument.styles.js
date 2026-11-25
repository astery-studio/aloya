import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const { espacamentos, radius, typography } = tema;
    const { margemHorizontalTela } = tema.espacamentosLayout;
    const cores = tema.cores.interface;
    const textoLeitura = {
        ...typography.caption,
        fontFamily: fontFamilies.regular,
        fontWeight: '400'
    };
    const semibold = { fontFamily: fontFamilies.semibold, fontWeight: '600' };

    return StyleSheet.create({
        conteudo: {
            paddingHorizontal: margemHorizontalTela,
            paddingTop: espacamentos.pequeno,
            paddingBottom: espacamentos.pequeno,
            gap: espacamentos.medio,
            width: '100%',
            maxWidth: 680,
            alignSelf: 'center'
        },
        identificacao: { gap: espacamentos.minimo },
        titulo: { ...typography.h2, color: cores.textoPrincipal },
        meta: { ...typography.caption, color: cores.textoSecundario },
        corpo: { ...textoLeitura, color: cores.textoPrincipal },
        resumo: {
            padding: espacamentos.medio,
            gap: espacamentos.pequeno,
            borderRadius: radius.grande,
            backgroundColor: tema.cores.neutras.superficieClara
        },
        linha: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: espacamentos.pequeno
        },
        tituloResumo: {
            ...typography.bodyDefault,
            ...semibold,
            color: tema.cores.marca.secundaria,
            flex: 1,
            minWidth: 0
        },
        textoResumo: { ...textoLeitura, color: tema.cores.neutras.textoPrincipalClaro },
        secoes: { gap: espacamentos.pequeno },
        barraSecoes: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            columnGap: espacamentos.medio
        },
        chamada: { ...typography.bodyDefault, ...semibold, color: cores.textoPrincipal },
        acao: { minHeight: 48, justifyContent: 'center' },
        pressionado: { opacity: 0.72 },
        textoAcao: {
            ...typography.caption,
            ...semibold,
            color: cores.destaque,
            textDecorationLine: 'underline'
        }
    });
}

export { criarEstilos };
