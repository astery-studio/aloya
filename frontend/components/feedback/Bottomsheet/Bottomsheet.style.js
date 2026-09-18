import { StyleSheet } from 'react-native'
import { tema } from '../../../theme'

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        justifyContent: 'flex-end'
    },

    fundo: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor:
            `${tema.cores.neutras.textoPrincipalClaro}66`
    },

    painel: {
        maxHeight: '90%',
        paddingBottom: tema.espacamentos.grande,
        backgroundColor:
            tema.cores.neutras.superficieClara,
        borderTopLeftRadius:
            tema.radius.bottomSheet,
        borderTopRightRadius:
            tema.radius.bottomSheet,
        ...tema.shadows.sheet
    }
})

export { estilos }