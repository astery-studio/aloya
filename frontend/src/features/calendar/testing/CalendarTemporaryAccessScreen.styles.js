import {StyleSheet} from 'react-native'

import {cores, fontFamilies} from '../../../shared/theme'

const estilos = StyleSheet.create({
    conteudo: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12
    },
    titulo: {
        color: cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 30,
        textAlign: 'center'
    },
    descricao: {
        marginBottom: 12,
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center'
    }
})

export {estilos}
