//Define a organização visual da seção de permissões gerais.
import {StyleSheet} from 'react-native'
import {fontFamilies} from '../../../shared/theme'
import {temaClaro} from '../../../shared/theme/themePalettes'

function criarEstilos(tema) {
    return StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'stretch'
    },

    titulo: {
        color: tema.cores.interface.textoPrincipal,
        fontFamily: fontFamilies.bold,
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 26,
        includeFontPadding: false,
        marginBottom: 16
    },

    lista: {
        width: '100%',
        gap: 10
    }
    })
}

const estilos = criarEstilos(temaClaro)

export {criarEstilos, estilos}
