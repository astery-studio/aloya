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
    },

    navegacaoSegura: {
        width: '100%',
        flexShrink: 0,
        backgroundColor: tema.cores.neutras.superficieClara
    }
})

export { estilos }
