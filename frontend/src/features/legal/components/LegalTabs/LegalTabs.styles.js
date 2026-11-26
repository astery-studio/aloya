import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    const { espacamentos, radius, typography } = tema;
    const { margemHorizontalTela } = tema.espacamentosLayout;
    const cores = tema.cores.interface;
    const escala = 0.8;

    return StyleSheet.create({
        container: {
            flexDirection: 'row',
            gap: espacamentos.minimo,
            marginHorizontal: margemHorizontalTela,
            marginBottom: espacamentos.pequeno * escala,
            paddingHorizontal: espacamentos.minimo,
            paddingVertical: espacamentos.minimo * escala,
            borderRadius: radius.grande * escala,
            backgroundColor: cores.superficie,
            borderWidth: 1,
            borderColor: cores.borda
        },
        aba: {
            flex: 1,
            minWidth: 0,
            minHeight: 48 * escala
        },
        rotulo: {
            flex: 1,
            justifyContent: 'center',
            paddingVertical: espacamentos.minimo * escala,
            paddingHorizontal: espacamentos.minimo
        },
        ativo: {
            marginVertical: (espacamentos.minimo / 2) * escala,
            borderRadius: radius.medio * escala,
            backgroundColor: cores.destaque
        },
        texto: {
            ...typography.bodyDefault,
            fontSize: typography.bodyDefault.fontSize * escala,
            lineHeight: typography.bodyDefault.lineHeight * escala,
            textAlign: 'center',
            color: cores.textoSecundario
        },
        textoAtivo: {
            fontFamily: fontFamilies.semibold,
            fontWeight: '600',
            color: cores.textoSobreDestaque
        },
        pressionado: { opacity: 0.72 }
    });
}

export { criarEstilos };
