import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            flexShrink: 1,
            backgroundColor: tema.cores.interface.superficieElevada
        },

        cabecalho: {
            minHeight: 62,
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 12,
            paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela,
            backgroundColor: tema.cores.interface.superficieElevada
        },

        cabecalhoCompacto: {
            height: 54,
            minHeight: 54,
            paddingTop: 0
        },

        titulo: {
            flex: 1,
            flexShrink: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            lineHeight: 27
        },

        tituloCompacto: {
            fontSize: 17,
            lineHeight: 26
        },

        botaoFechar: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20
        },

        botaoFecharCompacto: {
            width: 36,
            height: 36,
            marginRight: -8
        },

        desabilitado: {
            opacity: 0.5
        },

        conteudo: {
            flexShrink: 1,
            paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela,
            backgroundColor: tema.cores.interface.superficieElevada
        }
    });
}

export { criarEstilos };
