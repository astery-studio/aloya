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
            borderRadius: tema.escuro ? 12 : tema.radius.buttonAndInput,
            borderWidth: tema.escuro ? 0.705 : 1.41,
            borderColor: tema.escuro ? '#2C2C2C' : tema.cores.interface.borda,
            backgroundColor: tema.escuro ? '#1E1E1E' : tema.cores.interface.superficie
        },

        labelIntensidade: tema.escuro ? { color: '#E3E3E3' } : {},
        descricaoIntensidade: tema.escuro ? { color: '#999999' } : {},
        descricaoIntensidadeSelecionada: tema.escuro ? { color: '#E3E3E3' } : {},

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

        compacto: {
            minHeight: 28,
            alignSelf: 'flex-start',
            marginBottom: 0,
            paddingVertical: 3,
            paddingHorizontal: 8,
            gap: 3,
            borderRadius: 99
        },

        textosCompactos: { flex: 0 },

        labelCompacto: {
            fontFamily: fontFamilies.semibold,
            fontSize: 11,
            lineHeight: 16
        },

        labelModoCor: {
            fontSize: 16,
            lineHeight: 24
        },

        labelModoCorSelecionado: {
            color: tema.cores.interface.textoSobreDestaque,
            fontFamily: fontFamilies.bold,
            fontWeight: '700'
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
