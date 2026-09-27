import { StyleSheet } from 'react-native'
import { tema } from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        gap: 40
    },

    campos: {
        width: '100%',
        gap: tema.espacamentos.medio
    }
})

export { estilos }