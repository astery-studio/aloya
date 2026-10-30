/**
 * Centraliza os estilos das variantes simples, alerta e ação.
 */
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        fundo: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            backgroundColor: tema.cores.interface.sobreposicao
        },

        flexivel: { flex: 1 },

        rolagem: {
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 16
        },

        caixa: {
            width: '100%',
            maxWidth: 342,
            borderRadius: tema.radius.popup,
            backgroundColor: tema.cores.interface.superficieElevada,
            overflow: 'hidden'
        },

        caixaSimples: {
            ...tema.shadows.popup
        },

        caixaAlerta: {
            ...tema.shadows.alert
        },

        caixaAcao: {
            ...tema.shadows.popup
        },

        conteudo: {
            alignItems: 'center'
        },

        conteudoSimples: {
            paddingTop: 32,
            paddingHorizontal: 24,
            paddingBottom: 24,
            gap: 16
        },

        conteudoAlerta: {
            paddingTop: 24,
            paddingHorizontal: 24,
            paddingBottom: 28,
            gap: 20
        },

        conteudoAcao: {
            paddingTop: 32,
            paddingHorizontal: 24,
            paddingBottom: 24,
            gap: 16
        },

        cabecalhoAlerta: {
            width: '100%',
            paddingTop: 28,
            paddingHorizontal: 24,
            paddingBottom: 20,
            alignItems: 'center',
            gap: 12,
            backgroundColor: tema.cores.feedback.erro
        },

        iconeAlerta: {
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.15)'
        },

        areaIcone: {
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.escuro ? tema.cores.interface.separador : '#F5EDE3'
        },

        areaIconeAcao: {
            backgroundColor: tema.escuro ? tema.cores.interface.separador : '#FDF4F2'
        },

        textos: {
            width: '100%',
            alignItems: 'center'
        },

        titulo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 17,
            fontWeight: '700',
            lineHeight: 22.1,
            textAlign: 'center'
        },

        mensagem: {
            paddingTop: 8,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        },

        mensagemAlerta: {
            lineHeight: 21.7,
            paddingTop: 10
        },

        destaque: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 14,
            fontWeight: '700',
            lineHeight: 21.7,
            textAlign: 'center'
        },

        acoes: {
            width: '100%',
            gap: 10,
            paddingTop: 4
        }
    });
}

export { criarEstilos };
