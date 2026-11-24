import { StyleSheet } from 'react-native';

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

        areaTitulo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela,
            paddingBottom: 0
        },

        areaTituloComVoltar: {
            paddingHorizontal: 12
        },

        titulo: {
            flex: 1,
            flexShrink: 1,
            ...tema.headerTypography.principal,
            color: tema.cores.interface.textoPrincipal
        },

        tituloComVoltar: {
            ...tema.headerTypography.compacto,
            textAlign: 'center'
        },

        acoes: {
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
        },

        containerVoltar: {
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24
        },

        espacadorVoltar: {
            width: 48,
            height: 48,
            flexShrink: 0
        },

        desabilitado: {
            opacity: 0.5
        }
    });
}

export { criarEstilos };
