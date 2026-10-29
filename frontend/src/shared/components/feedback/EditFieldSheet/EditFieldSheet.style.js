import { Platform, StyleSheet } from 'react-native'
import { tema } from '../../../theme'

const estilos = StyleSheet.create({
    caixaCampo: {
        width: '100%',
        height: 56,
        marginTop: 24,
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1.41,
        borderColor: tema.cores.marca.secundaria,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    caixaCampoNumero: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 4
    },

    campo: {
        ...tema.typography.bodyDefault,
        width: '100%',
        height: 24,
        padding: 0,
        color: tema.cores.neutras.textoPrincipalClaro,
        textAlignVertical: 'center',
        includeFontPadding: false,
        ...Platform.select({
            ios: {
                transform: [{ translateY: -4 }]
            },
            default: {}
        })
    },

    campoData: {
        textAlign: 'center'
    },

    campoNumero: {
        width: 24,
        textAlign: 'left'
    },

    sufixoNumero: {
        ...tema.typography.bodyDefault,
        color: tema.cores.neutras.textoPrincipalClaro
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
})

export { estilos }
