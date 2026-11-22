// Define a apresentação responsiva e tematizada do resumo do Diário.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

// Converte os tokens do tema em estilos nativos do cartão.
function criarEstilos(tema) {
    const cores = obterCoresDiario(tema).interface;
    return StyleSheet.create({
        cartao: {
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: cores.borda,
            borderRadius: tema.radius.grande,
            backgroundColor: cores.superficie
        },
        cabecalho: {
            paddingTop: 16,
            paddingHorizontal: 20,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: cores.borda,
            color: cores.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 13,
            lineHeight: 18,
            letterSpacing: 0.8,
            textAlign: 'center'
        },
        conteudo: {
            minHeight: 90,
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'stretch'
        },
        areaIcone: {
            width: 70,
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            borderRightWidth: 1,
            borderRightColor: cores.borda
        },
        textos: {
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 2,
            padding: 10
        },
        titulo: {
            color: cores.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20
        },
        fase: { fontFamily: fontFamilies.bold },
        descricao: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 11,
            lineHeight: 17
        },
        rodape: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: cores.borda
        },
        quantidade: {
            width: 266,
            maxWidth: '100%',
            overflow: 'hidden',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: tema.radius.circular,
            color: cores.destaque,
            backgroundColor: cores.destaqueSuave,
            fontFamily: fontFamilies.semiBold,
            fontSize: 12,
            lineHeight: 16,
            textAlign: 'center'
        },
        carregando: { minHeight: 132, alignItems: 'center', justifyContent: 'center', gap: 10 },
        textoCarregando: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20
        }
    });
}

export { criarEstilos };
