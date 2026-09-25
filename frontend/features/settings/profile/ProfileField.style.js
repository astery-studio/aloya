import { StyleSheet } from 'react-native'
import { fontFamilies, tema } from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: 65,
        flexDirection: 'row',
        alignItems: 'center',
        gap: tema.espacamentos.medio,
        paddingHorizontal: tema.espacamentos.medio,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 0.7,
        borderColor: tema.cores.neutras.bordaClara,
        backgroundColor: tema.cores.neutras.superficieClara
    },

    pressionado: {
        opacity: 0.72
    },

    desabilitado: {
        opacity: 0.5
    },

    textos: {
        flex: 1,
        minWidth: 0
    },

    label: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 21
    },

    valor: {
        ...tema.typography.bodyDefault,
        color: tema.cores.neutras.textoPrincipalClaro
    }
})

const corIconeEditar = tema.cores.neutras.bordaTracejada

export { estilos, corIconeEditar }