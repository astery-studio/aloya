// Define a geometria responsiva da linha do tempo e de seus estados de paginação.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

// Converte os tokens do tema em estilos da lista, trilho e rodapé.
function criarEstilos(tema) {
    const cores = obterCoresDiario(tema).interface;
    return StyleSheet.create({
        lista: { paddingHorizontal: 20, paddingBottom: 24 },
        item: { flexDirection: 'row' },
        trilho: { width: 69, alignItems: 'center' },
        marcador: {
            zIndex: 1,
            width: 50,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 36,
            borderWidth: 1,
            borderColor: cores.borda,
            borderRadius: 25,
            backgroundColor: cores.superficie
        },
        linhaSuperior: {
            position: 'absolute',
            top: 0,
            height: 61,
            width: 1,
            backgroundColor: cores.borda
        },
        linhaInferior: {
            position: 'absolute',
            top: 86,
            bottom: 0,
            width: 1,
            backgroundColor: cores.borda
        },
        linhaHorizontal: {
            position: 'absolute',
            top: 61,
            right: 0,
            width: 20,
            height: 1,
            backgroundColor: cores.borda
        },
        cartao: { flex: 1, paddingBottom: 24 },
        rodape: { alignItems: 'center', gap: 8, paddingVertical: 18 },
        rodapeCarregando: {
            minHeight: 40,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 10
        },
        textoCarregando: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 11,
            lineHeight: 16
        },
        textoRodape: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19,
            textAlign: 'center'
        },
        tentarNovamente: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
        textoTentarNovamente: {
            color: cores.destaque,
            fontFamily: fontFamilies.semiBold,
            fontSize: 14,
            lineHeight: 20
        },
        pressionado: { opacity: 0.7 }
    });
}

export { criarEstilos };
