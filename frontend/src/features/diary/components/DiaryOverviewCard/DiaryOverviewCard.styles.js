// Define a apresentação responsiva e tematizada do resumo do Diário.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

// Converte os tokens do tema em estilos nativos do cartão.
function criarEstilos(tema) {
    return StyleSheet.create({
        cartao: {
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            borderRadius: tema.radius.grande,
            backgroundColor: tema.cores.interface.superficieElevada
        },
        cabecalho: {
            paddingTop: 16,
            paddingHorizontal: 20,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: tema.cores.interface.borda,
            color: tema.cores.interface.textoSecundario,
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
            borderRightColor: tema.cores.interface.borda
        },
        textos: {
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 2,
            padding: 10
        },
        titulo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20
        },
        fase: { fontFamily: fontFamilies.bold },
        descricao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 11,
            lineHeight: 17
        },
        rodape: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: tema.cores.interface.borda
        },
        quantidade: {
            width: 266,
            maxWidth: '100%',
            overflow: 'hidden',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: tema.radius.circular,
            color: tema.cores.interface.destaque,
            backgroundColor: tema.cores.interface.destaqueSuave,
            fontFamily: fontFamilies.semiBold,
            fontSize: 12,
            lineHeight: 16,
            textAlign: 'center'
        },
        carregando: { minHeight: 132, alignItems: 'center', justifyContent: 'center', gap: 10 },
        textoCarregando: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20
        }
    });
}

export { criarEstilos };
