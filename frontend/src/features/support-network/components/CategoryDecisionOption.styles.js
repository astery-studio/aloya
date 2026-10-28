import {
    StyleSheet
} from 'react-native'

import {
    cores,
    fontFamilies,
    radius
} from '../../../shared/theme'

const COR_PERIGO = '#BD3E3E'

const estilos = StyleSheet.create({
    opcao: {
        width: '100%',
        minHeight: 64,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1.4,
        borderColor:
            cores.neutras.bordaClara,
        borderRadius:
            radius.buttonAndInput,
        backgroundColor:
            cores.neutras
                .superficieClara,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:
            'space-between',
        gap: 12
    },

    opcaoSelecionadaPerigo: {
        borderColor: COR_PERIGO
    },

    opcaoSelecionadaManter: {
        borderColor:
            cores.marca.secundaria
    },

    fundoPerigo: {
        backgroundColor: '#FDF0F0'
    },

    fundoManter: {
        backgroundColor: '#F0F5F2'
    },

    textos: {
        flex: 1,
        gap: 2
    },

    indicador: {
        width: 22,
        height: 22,
        flexShrink: 0,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor:
            cores.neutras
                .bordaTracejada,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:
            cores.neutras
                .superficieClara
    },

    indicadorPerigo: {
        borderColor: COR_PERIGO,
        backgroundColor: COR_PERIGO
    },

    indicadorManter: {
        borderColor:
            cores.marca.secundaria,
        backgroundColor:
            cores.marca.secundaria
    },

    centroIndicador: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor:
            cores.neutras
                .superficieClara
    },

    titulo: {
        color:
            cores.neutras
                .textoSecundarioClaro,
        fontFamily:
            fontFamilies.regular,
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 20
    },

    tituloPerigo: {
        color: COR_PERIGO,
        fontFamily:
            fontFamilies.semibold,
        fontWeight: '600'
    },

    tituloManter: {
        color:
            cores.marca.secundaria,
        fontFamily:
            fontFamilies.semibold,
        fontWeight: '600'
    },

    descricao: {
        color:
            cores.neutras
                .textoSecundarioClaro,
        fontFamily:
            fontFamilies.regular,
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 19
    },

    pressionada: {
        opacity: 0.7,
        transform: [
            {
                scale: 0.99
            }
        ]
    },

    desabilitada: {
        opacity: 0.5
    }
})

export {
    COR_PERIGO,
    estilos
}