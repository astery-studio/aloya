import { StyleSheet } from 'react-native'
import { tema } from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal:
            tema.espacamentosLayout.margemHorizontalTela
    },

    lateral: {
        width: 44
    },

    botaoVoltar: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center'
    },

    seta: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontSize: 26
    },

    titulo: {
        flex: 1,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center'
    }
})

export { estilos }