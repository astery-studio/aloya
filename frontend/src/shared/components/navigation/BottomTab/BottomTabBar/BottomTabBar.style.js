import { StyleSheet } from 'react-native'
import { tema } from '../../../../theme'

const estilos = StyleSheet.create({
    barra: {
        width: '100%',
        height: 66.67,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingTop: 12,
        paddingHorizontal: 12,
        paddingBottom: 0,
        backgroundColor: tema.cores.neutras.superficieClara,
        borderTopWidth: 0.666667,
        borderTopColor: tema.cores.neutras.bordaClara
    }
})

export { estilos }
