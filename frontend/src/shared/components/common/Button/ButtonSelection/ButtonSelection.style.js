import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            gap: tema.espacamentos.pequeno,
            marginBottom: 2,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: tema.radius.buttonAndInput
        },

        selecionado: {
            backgroundColor: tema.cores.interface.destaqueSuave
        },

        desabilitado: {
            opacity: 0.5
        },

        textos: {
            flex: 1,
            minWidth: 0
        },

        label: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            lineHeight: 24
        },

        labelSelecionado: {
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.bold
        },

        descricao: {
            marginTop: 4,
            color: tema.cores.interface.textoSecundario,
            ...tema.typography.caption
        },

        intensidade: {
            minHeight: 64,
            marginBottom: 0,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.borda,
            backgroundColor: tema.cores.interface.superficie
        },

        intensidadeSelecionada: {
            borderWidth: 1.41,
            borderColor: tema.cores.interface.destaque,
            backgroundColor: tema.cores.interface.destaqueSuave
        },

        modoCor: {
            minHeight: 52,
            marginBottom: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderWidth: 0,
            backgroundColor: 'transparent'
        },

        modoCorSelecionado: {
            backgroundColor: tema.cores.interface.destaque
        },

        labelModoCor: {
            fontSize: 16,
            lineHeight: 24
        },

        labelModoCorSelecionado: {
            color: tema.cores.interface.textoSobreDestaque,
            fontFamily: fontFamilies.bold
        },

        radioVazio: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.textoDesabilitado
        }
    });
}

export { criarEstilos };
