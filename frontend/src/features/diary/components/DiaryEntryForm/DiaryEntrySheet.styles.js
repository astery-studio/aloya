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
        navegadorData: { paddingTop: 10 },
        containerFase: {
            width: 294,
            maxWidth: '100%',
            height: 63.993,
            alignSelf: 'center',
            paddingTop: 8,
            paddingBottom: 20,
            flexDirection: 'column',
            alignItems: 'center'
        },
        tagFase: {
            height: 35.993,
            minHeight: 0,
            marginTop: 0,
            alignSelf: 'stretch',
            flexShrink: 0,
            paddingVertical: 0,
            paddingHorizontal: 14,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            borderRadius: 10
        },
        textoFase: {
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19.5,
            textAlign: 'center'
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
            marginTop: 0,
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
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
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
            maxWidth: 311,
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
