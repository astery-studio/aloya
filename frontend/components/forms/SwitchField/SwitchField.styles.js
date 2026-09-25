//Define o visual da linha de permissão e da versão compacta do interruptor.
import {StyleSheet} from 'react-native'
import {fontFamilies, tema} from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: 63,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: tema.cores.neutras.superficieClara,
        borderWidth: 1.41,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: 14
    },

    controle: {
        width: 48,
        minHeight: 44,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },

    pressionado: {
        opacity: 0.82
    },

    desabilitado: {
        opacity: 0.5
    },

    titulo: {
        flex: 1,
        minWidth: 0,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.semibold,
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 21,
        includeFontPadding: false
    },

    trilha: {
        width: 48,
        height: 28,
        flexShrink: 0,
        borderRadius: tema.radius.switch
    },

    trilhaAtiva: {
        backgroundColor: tema.cores.marca.secundaria
    },

    trilhaInativa: {
        backgroundColor: tema.cores.neutras.switchInativo
    },

    indicador: {
        position: 'absolute',
        top: 3,
        left: 3,
        width: 22,
        height: 22,
        backgroundColor: tema.cores.neutras.superficieClara,
        borderRadius: 11,
        shadowColor: tema.cores.neutras.textoPrincipalClaro,
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2
    }
})

export {estilos}