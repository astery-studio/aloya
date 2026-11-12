// Define os estilos tematizados do conteúdo detalhado exibido no AppModal.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

// Converte os tokens do tema em estilos do detalhe e de seus grupos.
function criarEstilos(tema) {
    return StyleSheet.create({
        rolagem: { width: '100%', flexShrink: 1 },
        container: {
            width: '100%',
            alignItems: 'center',
            padding: 24,
            gap: 12
        },
        titulo: {
            width: '100%',
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 17,
            lineHeight: 22,
            textAlign: 'center'
        },
        resumoDia: {
            width: '100%',
            color: tema.cores.marca.primaria,
            fontFamily: fontFamilies.bold,
            fontSize: 10,
            lineHeight: 15,
            letterSpacing: 0.6,
            textAlign: 'center'
        },
        tituloAlteracao: { color: '#2C4C3B' },
        introducao: {
            width: '100%',
            color: tema.cores.interface.textoSecundario,
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
        separador: { flex: 1, height: 1, backgroundColor: tema.cores.interface.borda },
        tituloCategoria: {
            flexShrink: 1,
            color: tema.cores.interface.textoSecundario,
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
            backgroundColor: tema.cores.interface.destaqueSuave
        },
        textoChip: {
            flexShrink: 1,
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.semiBold,
            fontSize: 8.56,
            lineHeight: 16
        },
        anotacao: {
            width: '100%',
            alignSelf: 'stretch',
            padding: 6,
            borderWidth: 0.7,
            borderColor: '#E6E2D8',
            borderRadius: 6,
            color: '#5C5C59',
            backgroundColor: 'rgba(247, 245, 240, 0.5)',
            fontFamily: fontFamilies.regular,
            fontSize: 8,
            fontWeight: '300',
            lineHeight: 12
        },
        alteracao: { width: '100%', alignItems: 'center', gap: 12 },
        textoAlteracao: {
            color: tema.cores.interface.textoSecundario,
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
            backgroundColor: tema.cores.marca.primaria
        },
        botaoAcaoDesativado: { opacity: 0.5 },
        textoBotaoAcao: {
            color: '#FFFFFF',
            fontFamily: fontFamilies.semiBold,
            fontSize: 13,
            lineHeight: 20
        },
        faseRegistro: {
            width: '100%',
            minHeight: 35.99,
            height: 35.99,
            marginTop: 0,
            paddingVertical: 0
        },
        textoFaseRegistro: { fontSize: 13, lineHeight: 20 },
        areaBotaoOk: { width: '100%' },
        botaoOk: { width: '100%', height: 52, borderRadius: 12 },
        textoBotaoOk: {
            fontFamily: fontFamilies.medium,
            fontSize: 16,
            lineHeight: 24
        },
        pressionado: { opacity: 0.72 },
        estado: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 16 },
        tituloErro: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            lineHeight: 27,
            textAlign: 'center'
        },
        mensagemEstado: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        }
    });
}

export { criarEstilos };
