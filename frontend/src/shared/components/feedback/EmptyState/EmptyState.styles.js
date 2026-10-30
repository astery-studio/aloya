import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: { width: '100%', alignItems: 'center' },
        vazio: { gap: 20 },
        erro: { gap: 20 },
        apresentacao: { gap: 24 },
        textos: { width: '100%', alignItems: 'center' },
        titulo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            textAlign: 'center'
        },
        titulo_vazio: { fontSize: 18, lineHeight: 27 },
        titulo_erro: { fontSize: 18, lineHeight: 27 },
        titulo_apresentacao: { fontSize: 22, lineHeight: 30 },
        mensagem: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            textAlign: 'center'
        },
        mensagem_vazio: { paddingTop: 10, fontSize: 15, lineHeight: 22 },
        mensagem_erro: { paddingTop: 10, fontSize: 15, lineHeight: 22 },
        mensagem_apresentacao: { paddingTop: 8, fontSize: 15, lineHeight: 24 },
        acao: { width: '100%' }
    });
}

export { criarEstilos };
