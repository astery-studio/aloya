//Define somente os estilos da galeria provisória dos componentes de configurações.
import { StyleSheet } from 'react-native'

import { fontFamilies, tema } from './theme'

const estilos = StyleSheet.create({
    carregamento: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: tema.espacamentos.grande,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    textoCarregamento: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center'
    },

    conteudo: {
        gap: tema.espacamentos.grande,
        paddingBottom: tema.espacamentos.grande
    },

    mensagem: {
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
        gap: tema.espacamentos.pequeno
    },

    tituloSecao: {
        marginLeft: 4,
        marginBottom: 2,
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 21
    },

    botaoTeste: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: tema.espacamentos.medio,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: tema.cores.marca.secundaria,
        backgroundColor: tema.cores.neutras.superficieClara
    },

    botaoTestePressionado: {
        opacity: 0.72
    },

    textoBotaoTeste: {
        color: tema.cores.marca.secundaria,
        fontFamily: fontFamilies.semibold,
        fontSize: 16,
        lineHeight: 24
    },

    rodape: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tema.espacamentos.extraGrande
    },

    separadorRodape: {
        width: 1,
        height: 16,
        backgroundColor: tema.cores.neutras.bordaClara
    },

    linkPerigo: {
        color: tema.cores.feedback.erro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textDecorationLine: 'underline'
    },

    linkNormal: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textDecorationLine: 'underline'
    },

    linkPressionado: {
        opacity: 0.6
    }
})

export { estilos }