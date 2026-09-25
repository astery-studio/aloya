import {StyleSheet} from 'react-native'
import {fontFamilies, tema} from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        minWidth: 85,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: tema.cores.icones.anticoncepcionais.verde.caixa,
        borderRadius: 999
    },

    texto: {
        color: tema.cores.icones.anticoncepcionais.verde.icone,
        fontFamily: fontFamilies.semibold,
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
        includeFontPadding: false
    }
})

export {estilos}