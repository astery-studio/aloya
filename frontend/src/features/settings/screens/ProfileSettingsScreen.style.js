import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        estadoTela: {
            flex: 1,
            minHeight: 440,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: tema.espacamentos.pequeno
        },

        textoEstado: {
            marginTop: tema.espacamentos.medio,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            lineHeight: 24,
            textAlign: 'center'
        },

        tituloErro: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            lineHeight: 27,
            textAlign: 'center'
        },

        mensagemErro: {
            maxWidth: 292,
            marginTop: 8,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center'
        },

        botaoErro: {
            marginTop: 32
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
            backgroundColor: tema.cores.interface.borda
        },

        acaoPerigo: {
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textDecorationLine: 'underline'
        },

        acaoNormal: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            textDecorationLine: 'underline'
        },

        acaoPressionada: {
            opacity: 0.6
        },

        acaoDesabilitada: {
            opacity: 0.4
        }
    });
}

/*
 * Mantém compatibilidade temporária até a ProfileSettingsScreen
 * passar a consumir diretamente o tema ativo.
 */
const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
