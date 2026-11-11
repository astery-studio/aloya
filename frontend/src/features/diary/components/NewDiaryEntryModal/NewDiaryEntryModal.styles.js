import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        painel: { height: '92%', backgroundColor: '#FFFFFF' },
        rolagem: { flex: 1 },
        conteudo: { paddingBottom: 24 },
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
        cartaoRegistro: {
            marginHorizontal: 24,
            marginTop: 20,
            marginBottom: 24,
            padding: 16,
            borderWidth: 1.41,
            borderColor: '#E6E2D8',
            borderRadius: 16,
            backgroundColor: '#FFFFFF'
        },
        tituloCartao: {
            fontFamily: fontFamilies.bold,
            fontSize: 15,
            lineHeight: 20,
            textAlign: 'center',
            color: '#222222'
        },
        contador: {
            alignSelf: 'center',
            marginTop: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: '#EEF4F0'
        },
        textoContador: {
            fontFamily: fontFamilies.semiBold,
            fontSize: 12,
            lineHeight: 16,
            color: '#2C4C3B'
        },
        instrucao: {
            marginTop: 10,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19,
            textAlign: 'center',
            color: '#5C5C59'
        },
        listaMacros: {
            marginTop: 14
        },
        botaoSalvar: {
            minHeight: 54,
            borderRadius: 10,
            backgroundColor: '#C85A44'
        },
        botaoSalvarDesativado: {
            backgroundColor: '#E6E2D8'
        },
        textoBotaoSalvar: {
            fontFamily: fontFamilies.semiBold,
            fontSize: 15,
            color: '#FFFFFF'
        },
        textoBotaoDesativado: {
            color: '#8A8985'
        },
        rodape: {
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 12,
            borderTopWidth: 1,
            borderColor: '#E6E2D8',
            backgroundColor: '#FFFFFF'
        }
    });
}

export { criarEstilos };
