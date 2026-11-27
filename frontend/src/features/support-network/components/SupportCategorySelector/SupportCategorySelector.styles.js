//Define a apresentação do acordeão de categorias cadastradas.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';

function criarEstilos(tema) {
    const { escuro, cores } = tema;
    const corDestaque = escuro ? coresNoturnasConteudo.verde : cores.interface.destaque;
    const superficie = escuro ? coresNoturnasConteudo.superficie : cores.interface.superficie;
    const textoSecundario = escuro
        ? coresNoturnasConteudo.textoSecundario
        : cores.interface.textoSecundario;
    return StyleSheet.create({
        container: {
            width: '100%',
            maxWidth: 342,
            height: 60,
            alignSelf: 'center',
            overflow: 'hidden',
            backgroundColor: superficie,
            borderWidth: 1.41,
            borderColor: tema.escuro ? coresNoturnasConteudo.borda : tema.cores.interface.borda,
            borderRadius: 14
        },

        containerExpandido: {
            borderColor: tema.escuro ? corDestaque : 'rgba(44, 76, 59, 0.33)'
        },

        cabecalho: {
            width: '100%',
            height: 60,
            minHeight: 60,
            paddingHorizontal: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            backgroundColor: superficie
        },

        cabecalhoExpandido: {
            height: 60,
            backgroundColor: tema.escuro ? 'rgba(165, 214, 167, 0.10)' : 'rgba(238, 244, 240, 0.53)'
        },

        caixaIcone: {
            width: 34,
            height: 34,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.escuro ? 'rgba(165, 214, 167, 0.10)' : '#EEF4F0',
            borderRadius: 9
        },

        titulo: {
            width: 178,
            color: corDestaque,
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            fontWeight: '600',
            lineHeight: 21,
            textAlign: 'center',
            includeFontPadding: false
        },

        tituloExpandido: {
            color: corDestaque
        },

        conteudo: {
            width: '100%',
            flex: 1,
            borderTopWidth: 0.705,
            borderTopColor: tema.escuro ? coresNoturnasConteudo.borda : 'rgba(44, 76, 59, 0.20)',
            backgroundColor: superficie
        },

        conteudoLista: {
            width: '100%',
            alignItems: 'flex-start'
        },

        opcaoCategoria: {
            width: '100%',
            height: 52,
            paddingVertical: 6,
            paddingHorizontal: 40,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },

        opcaoCategoriaComDivisoria: {
            borderTopWidth: 0.705,
            borderTopColor: tema.escuro ? coresNoturnasConteudo.borda : '#F0EDE8'
        },

        containerTextoOpcao: {
            width: 225.18,
            minWidth: 0,
            flexShrink: 1,
            flexDirection: 'column',
            alignItems: 'flex-start'
        },

        textoOpcao: {
            color: textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 22.5
        },

        estado: {
            width: '100%',
            minHeight: 96,
            paddingHorizontal: 18,
            paddingVertical: 20,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
        },

        textoEstado: {
            color: textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center'
        },

        textoErro: {
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center'
        },

        botaoTentarNovamente: {
            minHeight: 40,
            paddingHorizontal: 18,
            paddingVertical: 9,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: corDestaque,
            borderRadius: tema.radius.buttonAndInput
        },

        textoBotao: {
            color: tema.escuro
                ? coresNoturnasConteudo.fundo
                : tema.cores.interface.textoSobreDestaque,
            fontFamily: fontFamilies.semibold,
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 20
        },

        pressionado: {
            opacity: 0.72
        },

        desabilitado: {
            opacity: 0.5
        }
    });
}

export { criarEstilos };
