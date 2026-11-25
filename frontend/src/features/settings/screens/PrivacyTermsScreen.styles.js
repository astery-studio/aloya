import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

export function criarEstilos(tema) {
    const { espacamentos: e, radius, typography } = tema;
    const { margemHorizontalTela } = tema.espacamentosLayout;
    const cor = tema.cores.interface;
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
        pressionado: { opacity: 0.72 }
    });
}
