//Centraliza os estilos visuais dos componentes do calendário.
import {StyleSheet} from 'react-native'

import {cores, fontFamilies} from '../../../../shared/theme'

const estilos = StyleSheet.create({
    celulaDia: {
        flex: 1,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center'
    },

    conteudoDia: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
    },

    segmentoDia: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },

    inicioSegmento: {
        borderTopLeftRadius: 28,
        borderBottomLeftRadius: 28
    },

    fimSegmento: {
        borderTopRightRadius: 28,
        borderBottomRightRadius: 28
    },

    separadorSegmento: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: 'rgba(255, 255, 255, 0.24)'
    },

    iconeDia: {
        height: 17,
        alignItems: 'center',
        justifyContent: 'center'
    },

    numeroDia: {
        color: cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center'
    },

    numeroDiaMarcado: {
        color: cores.neutras.superficieClara,
        fontFamily: fontFamilies.medium,
        fontSize: 18,
        lineHeight: 23
    },

    numeroDiaFuturo: {
        color: cores.neutras.bordaTracejada
    },

    pressionado: {
        opacity: 0.72
    }
})

const estilosTipos = StyleSheet.create({
    menstruacao: {
        backgroundColor: cores.marca.primaria
    },

    folicular: {
        backgroundColor: cores.marca.secundaria
    },

    ovulacao: {
        backgroundColor: cores.feedback.informacao
    },

    lutea: {
        backgroundColor: cores.feedback.aviso
    }
})

const estilosTiposPrevistos = StyleSheet.create({
    menstruacao: {
        backgroundColor: 'rgba(200, 90, 68, 0.58)'
    },

    folicular: {
        backgroundColor: 'rgba(44, 76, 59, 0.56)'
    },

    ovulacao: {
        backgroundColor: 'rgba(74, 117, 142, 0.56)'
    },

    lutea: {
        backgroundColor: 'rgba(214, 140, 58, 0.58)'
    }
})

export {
    estilos,
    estilosTipos,
    estilosTiposPrevistos
}