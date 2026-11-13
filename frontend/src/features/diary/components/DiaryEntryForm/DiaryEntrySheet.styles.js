import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

function criarEstilos(tema) {
    const diario = obterCoresDiario(tema);
    const cores = diario.interface;
    return StyleSheet.create({
        painel: {
            height: '92%',
            maxHeight: '92%',
            paddingBottom: 0,
            backgroundColor: cores.superficie
        },
        rolagem: { flex: 1 },
        conteudo: { alignItems: 'center', paddingHorizontal: 16 },
        carregamento: { minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 12 },
        mensagem: {
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20,
            textAlign: 'center',
            color: cores.textoSecundario
        },
        leitorTela: {
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            opacity: 0
        },
        erro: {
            fontFamily: fontFamilies.medium,
            fontSize: 13,
            lineHeight: 19,
            color: tema.cores.feedback.erro
        },
        cartaoRegistro: {
            width: '100%',
            maxWidth: 342,
            alignSelf: 'center',
            marginTop: 20,
            marginBottom: 24,
            padding: 16,
            borderWidth: 1.41,
            borderColor: cores.borda,
            borderRadius: 16,
            backgroundColor: cores.superficieElevada
        },
        tituloCartao: {
            fontFamily: fontFamilies.bold,
            fontSize: 15,
            lineHeight: 20,
            textAlign: 'center',
            color: cores.textoPrincipal
        },
        contador: {
            alignSelf: 'center',
            marginTop: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: cores.destaqueSuave
        },
        textoContador: {
            fontFamily: fontFamilies.semiBold,
            fontSize: 12,
            lineHeight: 16,
            color: cores.destaque
        },
        instrucao: {
            marginTop: 10,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19,
            textAlign: 'center',
            color: cores.textoSecundario
        },
        listaMacros: {
            width: '100%',
            maxWidth: 308,
            alignSelf: 'center',
            paddingTop: 14
        },
        botaoSalvar: {
            width: '100%',
            maxWidth: 342,
            height: 54,
            alignSelf: 'center',
            borderRadius: 10,
            backgroundColor: diario.primaria
        },
        botaoSalvarDesativado: { backgroundColor: cores.borda },
        textoBotaoSalvar: {
            fontFamily: fontFamilies.semiBold,
            fontSize: 15,
            color: diario.textoSobrePrimaria
        },
        textoBotaoDesativado: { color: cores.textoDesabilitado },
        rodape: {
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 20,
            borderTopWidth: 1,
            borderColor: cores.borda,
            backgroundColor: cores.superficie
        }
    });
}

export { criarEstilos };
