//Define a tela e o painel provisório usados para testar as configurações de perfil.
import { StyleSheet } from 'react-native'

import { fontFamilies, tema } from './theme'

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    estadoInicial: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: tema.espacamentos.grande,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    textoEstadoInicial: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center'
    },

    abrirPainel: {
        position: 'absolute',
        right: 16,
        bottom: 100,
        minWidth: 64,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderRadius: 21,
        backgroundColor: tema.cores.marca.secundaria,
        elevation: 4,
        shadowColor: tema.cores.neutras.textoPrincipalClaro,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.18,
        shadowRadius: 4
    },

    abrirPainelPressionado: {
        opacity: 0.72
    },

    textoAbrirPainel: {
        color: tema.cores.neutras.superficieClara,
        fontFamily: fontFamilies.semibold,
        fontSize: 14,
        lineHeight: 21
    },

    fundoPainel: {
        flex: 1,
        justifyContent: 'center',
        padding: tema.espacamentos.grande,
        backgroundColor: 'rgba(0, 0, 0, 0.42)'
    },

    painel: {
        width: '100%',
        maxHeight: '82%',
        overflow: 'hidden',
        borderRadius: 20,
        backgroundColor: tema.cores.neutras.superficieClara
    },

    conteudoPainel: {
        gap: tema.espacamentos.grande,
        padding: tema.espacamentos.grande
    },

    cabecalhoPainel: {
        gap: tema.espacamentos.pequeno
    },

    tituloPainel: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 22,
        lineHeight: 29
    },

    descricaoPainel: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21
    },

    mensagemPainel: {
        padding: 12,
        borderRadius: 10,
        color: tema.cores.marca.secundaria,
        backgroundColor: tema.cores.icones.configuracoes.verde.caixa,
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        lineHeight: 21
    },

    grupoPainel: {
        gap: tema.espacamentos.pequeno
    },

    tituloGrupo: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.semibold,
        fontSize: 16,
        lineHeight: 24
    },

    botaoPainel: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: tema.espacamentos.medio,
        borderWidth: 1,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: 12,
        backgroundColor: tema.cores.neutras.superficieClara
    },

    botaoPainelAtivo: {
        borderColor: tema.cores.marca.secundaria,
        backgroundColor: tema.cores.marca.secundaria
    },

    botaoPainelPerigo: {
        borderColor: tema.cores.feedback.erro,
        backgroundColor: tema.cores.icones.anticoncepcionais.vermelho.caixa
    },

    botaoPainelPressionado: {
        opacity: 0.72
    },

    textoBotaoPainel: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center'
    },

    textoBotaoPainelAtivo: {
        color: tema.cores.neutras.superficieClara
    },

    textoBotaoPainelPerigo: {
        color: tema.cores.feedback.erro
    },

    ajudaPainel: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 18
    }
})

export { estilos }