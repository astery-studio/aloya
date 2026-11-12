import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            backgroundColor: tema.cores.interface.fundo
        },

        containerComVoltar: tema.escuro
            ? {
                  backgroundColor: '#121212'
              }
            : {},

        espacamentoSuperior: {
            height: 12
        },

        espacamentoSuperiorComVoltar: {
            height: 4
        },

        espacamentoSuperiorRedeApoio: {
            height: 12
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

        areaTituloRedeApoio: {
            minHeight: 56,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingBottom: 12
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

        containerTituloRedeApoio: {
            flex: 1,
            alignSelf: 'stretch',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center'
        },

        tituloRedeApoio: {
            flex: 0,
            fontFamily: fontFamilies.bold,
            fontSize: 28,
            fontWeight: '700',
            lineHeight: 27.5
        },

        acoes: {
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginLeft: 16
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
