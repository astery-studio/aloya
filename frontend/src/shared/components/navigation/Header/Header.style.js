import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            backgroundColor: tema.cores.interface.fundo
        },

        espacamentoSuperior: {
            height: 56
        },

        espacamentoSuperiorComVoltar: {
            height: 48
        },

        areaTitulo: {
            minHeight: 66,
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela,
            paddingBottom: 32
        },

        areaTituloComVoltar: {
            minHeight: 72,
            alignItems: 'center',
            paddingLeft: 12,
            paddingRight: 60,
            paddingBottom: 24
        },

        titulo: {
            flex: 1,
            flexShrink: 1,
            ...tema.typography.h1,
            color: tema.cores.interface.textoPrincipal
        },

        tituloComVoltar: {
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 27,
            textAlign: 'center'
        },

        containerVoltar: {
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24
        },

        desabilitado: {
            opacity: 0.5
        }
    });
}

export { criarEstilos };
