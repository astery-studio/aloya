import {StyleSheet} from 'react-native'
import {tema} from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: 44,
        minWidth: 44,
        height: 44,
        minHeight: 44,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: tema.radius.buttonAndInput
    },

    pressionado: {
        opacity: 0.65,
        transform: [
            {
                scale: 0.96
            }
        ]
    }
})

const variantes = Object.freeze({
    neutro: Object.freeze({
        container: Object.freeze({
            backgroundColor: 'transparent',
            borderWidth: 0
        }),
        icone: tema.cores.neutras.textoSecundarioClaro
    }),

    perigo: Object.freeze({
        container: Object.freeze({
            backgroundColor: 'transparent',
            borderWidth: 0
        }),
        icone: tema.cores.feedback.erro
    }),

    selecionado: Object.freeze({
        container: Object.freeze({
            backgroundColor: tema.cores.neutras.superficieClara,
            borderWidth: 1,
            borderColor: tema.cores.neutras.bordaClara
        }),
        icone: tema.cores.neutras.textoSecundarioClaro
    }),

    desativado: Object.freeze({
        container: Object.freeze({
            backgroundColor: 'transparent',
            borderWidth: 0,
            opacity: 0.4
        }),
        icone: tema.cores.neutras.textoSecundarioClaro
    })
})

export {estilos, variantes}