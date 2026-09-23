import { StyleSheet } from 'react-native'
import { cores, fontFamilies } from '../../../theme'

const estilos = StyleSheet.create({
    campoSenha: {
        width: '100%',
        gap: 6
    },

    erroSenha: {
        color: cores.feedback.erro,
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 18
    }
})

export { estilos }