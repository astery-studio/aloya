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
        fase: { fontFamily: fontFamilies.bold, fontWeight: '700' },
        descricao: {
            color: tema.escuro ? cores.textoSecundario : '#5C5C59',
            fontFamily: fontFamilies.regular,
            fontSize: 10,
            fontWeight: '400',
            lineHeight: 22.5
        },
        rodape: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: cores.borda
        },
        rodapeSemFase: { borderTopWidth: 0 },
        contadorNeutro: { backgroundColor: cores.borda },
        quantidadeNeutra: { color: cores.textoSecundario },
        contadorDias: {
            width: 266.59,
            maxWidth: '100%',
            height: 26,
            paddingHorizontal: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            borderRadius: 100
        },
        quantidade: {
            fontFamily: fontFamilies.semibold,
            fontSize: 10,
            fontWeight: '600',
            lineHeight: 19.5,
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
