// Define os estilos tematizados do conteúdo detalhado exibido no AppModal.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

// Converte os tokens do tema em estilos do detalhe e de seus grupos.
function criarEstilos(tema) {
    const diario = obterCoresDiario(tema);
    const cores = diario.interface;
    return StyleSheet.create({
        detalhes: { width: '100%', flexShrink: 1 },
        cabecalhoFixo: {
            width: '100%',
            alignItems: 'center',
            paddingTop: 24,
            paddingHorizontal: 24,
            gap: 0
        },
        navegadorData: {
            width: 294,
            maxWidth: '100%',
            marginTop: 12,
            padding: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 5
        },
        textoData: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.semiBold,
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 25.5
        },
        rolagem: { width: '100%', flexShrink: 1 },
        conteudoRolavel: {
            width: '100%',
            alignItems: 'center',
            paddingTop: 12,
            paddingHorizontal: 24,
            gap: 12
        },
        titulo: {
            width: '100%',
            color: cores.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 17,
            lineHeight: 22,
            textAlign: 'center'
        },
        resumoDia: {
            width: '100%',
            color: diario.primaria,
            fontFamily: fontFamilies.bold,
            fontSize: 10,
            lineHeight: 15,
            letterSpacing: 0.6,
            textAlign: 'center'
        },
        tituloAlteracao: { color: cores.destaque },
        introducao: {
            width: '100%',
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        },
        categorias: { width: '100%', gap: 12 },
        categoria: { width: '100%', alignItems: 'center', gap: 10 },
        tituloCategoriaLinha: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },
        separador: { flex: 1, height: 1, backgroundColor: cores.borda },
        tituloCategoria: {
            flexShrink: 1,
            color: cores.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 10,
            lineHeight: 15,
            letterSpacing: 0.55,
            textAlign: 'center'
        },
        chips: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 15,
            rowGap: 15
        },
        chip: {
            maxWidth: '100%',
            minHeight: 21.78,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: tema.radius.circular,
            backgroundColor: cores.destaqueSuave
        },
        textoChip: {
            flexShrink: 1,
            color: cores.destaque,
            fontFamily: fontFamilies.semiBold,
            fontSize: 8.56,
            fontWeight: '600',
            lineHeight: 16.5
        },
        anotacao: {
            width: '100%',
            alignSelf: 'stretch',
            padding: 6,
            borderWidth: 0.7,
            borderColor: cores.borda,
            borderRadius: 6,
            color: cores.textoSecundario,
            backgroundColor: tema.escuro ? cores.superficieElevada : 'rgba(247, 245, 240, 0.5)',
            fontFamily: fontFamilies.regular,
            fontSize: 8,
            fontWeight: '300',
            lineHeight: 12
        },
        alteracao: { width: '100%', alignItems: 'center', gap: 12 },
        textoAlteracao: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        },
        acoes: { width: '100%', flexDirection: 'row', gap: 22 },
        botaoAcao: {
            flex: 1,
            minWidth: 0,
            height: 35.99,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderRadius: 20,
            backgroundColor: diario.primaria
        },
        botaoAcaoDesativado: { opacity: 0.5 },
        textoBotaoAcao: {
            color: '#FFF',
            fontFamily: fontFamilies.semiBold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19.5,
            textAlign: 'center'
        },
        faseRegistro: {
            width: '100%',
            minHeight: 35.993,
            height: 35.993,
            marginTop: 0,
            alignSelf: 'stretch',
            paddingVertical: 0,
            paddingHorizontal: 14,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderRadius: 10
        },
        textoFaseRegistro: {
            fontFamily: fontFamilies.semiBold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19.5,
            textAlign: 'center'
        },
        areaBotaoOk: {
            width: '100%',
            flexShrink: 0,
            paddingTop: 12,
            paddingHorizontal: 24,
            paddingBottom: 24,
            backgroundColor: cores.superficie
        },
        botaoOk: {
            width: '100%',
            height: 52,
            borderRadius: 12,
            backgroundColor: cores.destaque
        },
        textoBotaoOk: {
            color: cores.textoSobreDestaque,
            fontFamily: fontFamilies.medium,
            fontSize: 16,
            lineHeight: 24
        },
        pressionado: { opacity: 0.72 },
        estado: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 16 },
        tituloErro: {
            color: cores.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            lineHeight: 27,
            textAlign: 'center'
        },
        mensagemEstado: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        }
    });
}

export { criarEstilos };
