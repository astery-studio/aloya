import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        painel: { height: '90%' },
        indicador: {
            alignSelf: 'center',
            width: 42,
            height: 4,
            marginTop: 10,
            borderRadius: 2,
            backgroundColor: tema.cores.interface.separador
        },
        cabecalho: {
            paddingHorizontal: 24,
            paddingTop: 14,
            paddingBottom: 16,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: tema.cores.interface.separador
        },
        titulo: {
            fontFamily: fontFamilies.bold,
            fontSize: 20,
            lineHeight: 28,
            color: tema.cores.interface.textoPrincipal
        },
        subtitulo: {
            marginTop: 2,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19,
            color: tema.cores.interface.textoSecundario
        },
        rolagem: { flex: 1 },
        conteudo: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, gap: 14 },
        carregamento: { minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 12 },
        mensagem: {
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20,
            textAlign: 'center',
            color: tema.cores.interface.textoSecundario
        },
        erro: {
            fontFamily: fontFamilies.medium,
            fontSize: 13,
            lineHeight: 19,
            color: tema.cores.interface.erro
        },
        rodape: {
            paddingHorizontal: 20,
            paddingTop: 14,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: tema.cores.interface.separador,
            backgroundColor: tema.cores.interface.superficieElevada
        }
    });
}

export { criarEstilos };
