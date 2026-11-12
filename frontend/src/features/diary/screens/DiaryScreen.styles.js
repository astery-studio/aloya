// Define a composição responsiva da tela do Diário e de sua ação fixa.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

// Converte os tokens do tema em estilos da screen e de seus estados.
function criarEstilos(tema) {
    return StyleSheet.create({
        tela: {
            flex: 1,
            minHeight: 0,
            alignSelf: 'stretch'
        },
        conteudoEstatico: { flex: 1, paddingHorizontal: 20 },
        introducao: {
            width: 350.011,
            maxWidth: '100%',
            alignSelf: 'center',
            alignItems: 'center',
            gap: 8,
            paddingTop: 8,
            paddingBottom: 20
        },
        descricao: {
            width: '100%',
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            lineHeight: 22
        },
        atualizando: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        textoAtualizando: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 17
        },
        estadoCentralizado: { flex: 1, justifyContent: 'center', paddingBottom: 56 },
        mensagemEstado: {
            marginTop: 10,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        },
        cabecalhoLista: { gap: 0, paddingTop: 0 },
        divisor: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingTop: 20,
            paddingBottom: 24
        },
        linhaDivisor: { flex: 1, height: 1, backgroundColor: tema.cores.interface.borda },
        textoDivisor: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 0.72
        },
        lista: { paddingBottom: 96 },
        acaoFixa: {
            position: 'absolute',
            right: 0,
            bottom: 0,
            left: 0,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: tema.cores.interface.borda,
            backgroundColor: tema.cores.interface.fundo
        }
    });
}

export { criarEstilos };
