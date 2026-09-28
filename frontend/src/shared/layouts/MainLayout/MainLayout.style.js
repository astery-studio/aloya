//Define a estrutura visual do layout principal das telas internas.
import { StyleSheet } from 'react-native'
import { tema } from '../../theme'

const estilos = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    conteudo: {
        flex: 1,
        minHeight: 0
    }
})

export { estilos }