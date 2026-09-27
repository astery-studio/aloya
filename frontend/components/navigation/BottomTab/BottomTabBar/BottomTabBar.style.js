import { StyleSheet } from 'react-native'
import { tema } from '../../../../theme'

const estilos = StyleSheet.create({
    barra: {
        width: '100%',
        height: 91,
        flexDirection: 'row',
        backgroundColor: tema.cores.neutras.superficieClara,
        borderTopWidth: 1,
        borderTopColor: tema.cores.neutras.bordaClara
    }
})

export { estilos }