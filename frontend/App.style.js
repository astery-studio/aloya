//Define somente os estilos da galeria provisória de componentes.
//Este arquivo pode ser removido junto com o App.js provisório quando os testes visuais terminarem.

import { StyleSheet } from 'react-native';

import { fontFamilies, tema } from './theme';

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    carregamento: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    textoCarregamento: {
        marginTop: 12,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center'
    },

    conteudo: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 80,
        gap: 24
    },

    introducao: {
        gap: 8,
        padding: 20,
        borderRadius: 16,
        backgroundColor: tema.cores.marca.secundaria
    },

    tituloPrincipal: {
        color: tema.cores.neutras.superficieClara,
        fontFamily: fontFamilies.bold,
        fontSize: 26,
        lineHeight: 32
    },

    descricaoPrincipal: {
        color: tema.cores.neutras.superficieClara,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21
    },

    mensagemInteracao: {
        padding: 12,
        borderRadius: 10,
        color: tema.cores.marca.secundaria,
        backgroundColor: tema.cores.icones.configuracoes.verde.caixa,
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center'
    },

    secao: {
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: 16,
        backgroundColor: tema.cores.neutras.superficieClara
    },

    tituloSecao: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 20,
        lineHeight: 26
    },

    descricaoSecao: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        lineHeight: 19
    },

    subtitulo: {
        marginTop: 4,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.semibold,
        fontSize: 15,
        lineHeight: 22
    },

    grupo: {
        gap: 10
    },

    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },

    itemFlexivel: {
        flex: 1
    },

    exemploFormField: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: tema.cores.icones.configuracoes.verde.caixa
    },

    textoExemplo: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21
    },

    previewHeader: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: 12,
        backgroundColor: tema.cores.neutras.superficieClara
    },

    previewBottomItem: {
        width: 90,
        height: 91,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: 12,
        backgroundColor: tema.cores.neutras.superficieClara
    },

    previewBottomBar: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: 12
    },

    previewLayout: {
        height: 500,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: 12
    },

    conteudoMainLayout: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },

    resultadoStorage: {
        padding: 12,
        borderRadius: 10,
        color: tema.cores.neutras.textoPrincipalClaro,
        backgroundColor: tema.cores.neutras.fundoClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21
    },

    conteudoBottomSheet: {
        gap: 16
    }
});

export { estilos };