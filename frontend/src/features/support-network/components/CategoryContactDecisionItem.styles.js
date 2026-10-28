import {
    StyleSheet
} from 'react-native'

import {
    cores,
    fontFamilies,
    radius
} from '../../../shared/theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 14,
        paddingTop: 20,
        paddingBottom: 16,
        borderWidth: 1.4,
        borderColor:
            cores.neutras.bordaClara,
        borderRadius:
            radius.buttonAndInput,
        backgroundColor:
            cores.neutras
                .superficieClara,
        gap: 16
    },

    nome: {
        alignSelf: 'center',
        color:
            cores.neutras
                .textoPrincipalClaro,
        fontFamily:
            fontFamilies.bold,
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 24,
        textAlign: 'center'
    },

    opcoes: {
        width: '100%',
        gap: 10
    }
})

export {estilos}