import { StyleSheet } from 'react-native'
import { tema } from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%'
    },

    espacamentoSuperior: {
        height: 56
    },

    areaTitulo: {
        minHeight: 66,
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal:
            tema.espacamentosLayout.margemHorizontalTela,
        paddingBottom: 32
    },

    areaTituloComVoltar: {
        height: 64,
        minHeight: 64,
        alignItems: 'center',
        paddingBottom: 16
    },

    titulo: {
        flex: 1,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 34
    },

    containerVoltar: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },

    iconeVoltar: {
        width: 32,
        height: 32,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontSize: 24,
        lineHeight: 32,
        textAlign: 'center'
    },

    espacamentoFinal: {
        width: 40
    }
})

export { estilos }
/**
 * Define a apresentação do cabeçalho e de suas áreas interativas.
 */
