import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../theme';
import { coresNoturnasConteudo } from '../../../theme/coresNoturnasConteudo';

function criarEstilos(tema, usarPaletaNoturnaConteudo = false) {
    const usarCoresDeConteudo = tema.escuro && usarPaletaNoturnaConteudo;
    const cores = usarCoresDeConteudo ? coresNoturnasConteudo : tema.cores.interface;
    return StyleSheet.create({
        container: { width: '100%', alignItems: 'center' },
        vazio: { gap: 20 },
        erro: { gap: 20 },
        apresentacao: { gap: 24 },
        textos: { width: '100%', alignItems: 'center' },
        titulo: {
            color: cores.textoPrincipal,
            fontFamily: fontFamilies.bold,
            textAlign: 'center'
        },
        titulo_vazio: { fontSize: 18, lineHeight: 27 },
        titulo_erro: { fontSize: 18, lineHeight: 27 },
        titulo_apresentacao: { fontSize: 22, lineHeight: 30 },
        mensagem: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            textAlign: 'center'
        },
        mensagem_vazio: { paddingTop: 10, fontSize: 15, lineHeight: 22 },
        mensagem_erro: {
            paddingTop: 10,
            fontSize: 15,
            lineHeight: 22,
            color: tema.escuro && !usarCoresDeConteudo ? '#99999999' : cores.textoSecundario
        },
        mensagem_apresentacao: { paddingTop: 8, fontSize: 15, lineHeight: 24 },
        acao: { width: '100%' }
    });
}

export { criarEstilos };
