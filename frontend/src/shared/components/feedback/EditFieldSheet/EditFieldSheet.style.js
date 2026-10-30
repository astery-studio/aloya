import { Platform, StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        caixaCampo: {
            width: '100%',
            height: 56,
            marginTop: 24,
            paddingHorizontal: 16,
            justifyContent: 'center',
            borderRadius: 12,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.destaque,
            backgroundColor: tema.cores.interface.fundo
        },

        caixaCampoNumero: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
        },

        campo: {
            ...tema.typography.bodyDefault,
            width: '100%',
            height: 24,
            padding: 0,
            color: tema.cores.interface.textoPrincipal,
            textAlignVertical: 'center',
            includeFontPadding: false,
            ...Platform.select({
                ios: {
                    transform: [
                        {
                            translateY: -4
                        }
                    ]
                },

                default: {}
            })
        },

        campoData: {
            textAlign: 'center'
        },

        campoNumero: {
            width: 32,
            textAlign: 'right'
        },

        sufixoNumero: {
            ...tema.typography.bodyDefault,
            color: tema.cores.interface.textoPrincipal
        },

        erro: {
            ...tema.typography.caption,
            marginTop: tema.espacamentos.pequeno,
            color: tema.cores.feedback.erro
        },

        espacoBotaoSalvar: {
            minHeight: 52,
            marginTop: tema.espacamentos.medio
        }
    });
}

export { criarEstilos };
