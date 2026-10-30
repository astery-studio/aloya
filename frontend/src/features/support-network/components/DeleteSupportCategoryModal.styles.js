import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            flexShrink: 1
        },

        rolagem: {
            flexShrink: 1
        },

        conteudoRolagem: {
            paddingTop: 12,
            paddingBottom: 20,
            gap: 20
        },

        aplicarTodos: {
            width: '100%',
            paddingHorizontal: 14,
            paddingTop: 18,
            paddingBottom: 16,
            borderWidth: 1.4,
            borderColor: tema.cores.interface.borda,
            borderRadius: tema.radius.buttonAndInput,
            backgroundColor: tema.cores.interface.superficie,
            gap: 14
        },

        tituloAplicar: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 17,
            fontWeight: '700',
            lineHeight: 24,
            textAlign: 'center'
        },

        descricaoAplicar: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21,
            textAlign: 'center'
        },

        opcoesAplicar: {
            gap: 10
        },

        separador: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },

        linha: {
            flex: 1,
            height: 1,
            backgroundColor: tema.cores.interface.separador
        },

        textoSeparador: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 0.4,
            textAlign: 'center'
        },

        listaContatos: {
            width: '100%',
            gap: 12
        },

        rodape: {
            width: '100%',
            paddingTop: 14,
            paddingBottom: 4,
            borderTopWidth: 1,
            borderTopColor: tema.cores.interface.borda,
            backgroundColor: tema.cores.interface.superficie
        },

        botaoConfirmar: {
            width: '100%'
        }
    });
}

export { criarEstilos };
