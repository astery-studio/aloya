//Define a estrutura visual compartilhada pelas telas internas de configurações.
import { StyleSheet } from 'react-native'
import { tema } from '../../theme'

const estilos = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    areaInterativa: {
        flex: 1
    },

    conteudo: {
        flexGrow: 1,
        paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela,
        paddingBottom: tema.espacamentos.grande
    },

    rodape: {
        width: '100%',
        alignItems: 'center',
        marginTop: 128.2,
        paddingBottom: tema.espacamentos.grande
    }
})

export { estilos }