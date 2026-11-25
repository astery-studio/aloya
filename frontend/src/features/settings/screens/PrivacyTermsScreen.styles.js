import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

export function criarEstilos(tema) {
    const { espacamentos: e, radius, typography } = tema;
    const { margemHorizontalTela } = tema.espacamentosLayout;
    const cor = tema.cores.interface;
    const textoLeitura = {
        ...typography.caption,
        fontFamily: fontFamilies.regular,
        fontWeight: '400'
    };
    const escalaAbas = 0.8;
    const semibold = { fontFamily: fontFamilies.semibold, fontWeight: '600' };

    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: cor.fundo },
        abas: {
            flexDirection: 'row',
            gap: e.minimo,
            marginHorizontal: margemHorizontalTela,
            marginBottom: e.pequeno * escalaAbas,
            paddingHorizontal: e.minimo,
            paddingVertical: e.minimo * escalaAbas,
            borderRadius: radius.grande * escalaAbas,
            backgroundColor: cor.superficie,
            borderWidth: 1,
            borderColor: cor.borda
        },
        aba: {
            flex: 1,
            minWidth: 0,
            minHeight: 48 * escalaAbas
        },
        rotuloAba: {
            flex: 1,
            justifyContent: 'center',
            paddingVertical: e.minimo * escalaAbas,
            paddingHorizontal: e.minimo
        },
        abaAtiva: {
            marginVertical: (e.minimo / 2) * escalaAbas,
            borderRadius: radius.medio * escalaAbas,
            backgroundColor: cor.destaque
        },
        textoAba: {
            ...typography.bodyDefault,
            fontSize: typography.bodyDefault.fontSize * escalaAbas,
            lineHeight: typography.bodyDefault.lineHeight * escalaAbas,
            textAlign: 'center',
            color: cor.textoSecundario
        },
        textoAbaAtiva: { ...semibold, color: cor.textoSobreDestaque },
        pressionado: { opacity: 0.72 },
        conteudo: {
            paddingHorizontal: margemHorizontalTela,
            paddingTop: e.pequeno,
            paddingBottom: e.pequeno,
            gap: e.medio,
            width: '100%',
            maxWidth: 680,
            alignSelf: 'center'
        },
        identificacao: { gap: e.minimo },
        titulo: { ...typography.h2, color: cor.textoPrincipal },
        meta: { ...typography.caption, color: cor.textoSecundario },
        corpo: { ...textoLeitura, color: cor.textoPrincipal },
        tituloResumo: {
            ...typography.bodyDefault,
            ...semibold,
            color: tema.cores.marca.secundaria
        },
        textoResumo: { ...textoLeitura, color: tema.cores.neutras.textoPrincipalClaro },
        enfase: semibold,
        chamada: { ...typography.bodyDefault, ...semibold, color: cor.textoPrincipal },
        resumo: {
            padding: e.medio,
            gap: e.pequeno,
            borderRadius: radius.grande,
            backgroundColor: tema.cores.neutras.superficieClara
        },
        linha: { flexDirection: 'row', alignItems: 'center', gap: e.pequeno },
        flexivel: { flex: 1, minWidth: 0 },
        secoes: { gap: e.pequeno },
        barraSecoes: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            columnGap: e.medio
        },
        acao: { minHeight: 48, justifyContent: 'center' },
        textoAcao: {
            ...typography.caption,
            ...semibold,
            color: cor.destaque,
            textDecorationLine: 'underline'
        },
        secao: {
            borderRadius: radius.grande,
            backgroundColor: cor.superficie,
            borderWidth: 1,
            borderColor: cor.borda
        },
        secaoAberta: { borderColor: cor.destaque },
        cabecalhoSecao: { minHeight: 48, paddingHorizontal: e.medio, paddingVertical: e.pequeno },
        numero: { ...typography.caption, color: cor.textoSecundario },
        tituloSecao: { ...typography.bodyDefault, ...semibold, color: cor.textoPrincipal },
        corpoSecao: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: cor.borda,
            padding: e.medio,
            gap: e.medio
        }
    });
}
