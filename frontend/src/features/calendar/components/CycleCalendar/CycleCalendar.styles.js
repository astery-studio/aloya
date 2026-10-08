//Centraliza os estilos visuais dos componentes do calendário.
import {StyleSheet} from 'react-native'

import {cores, fontFamilies} from '../../../../shared/theme'

const estilos = StyleSheet.create({
    calendario: {
        flex: 1,
        backgroundColor: cores.neutras.fundoClaro
    },

    cabecalhoSemana: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: cores.neutras.bordaClara,
        backgroundColor: cores.neutras.fundoClaro,
        zIndex: 4
    },

    nomeDiaSemana: {
        flex: 1,
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.semibold,
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center'
    },

    lista: {
        flex: 1
    },

    conteudoLista: {
        flexGrow: 1,
        justifyContent: 'flex-end'
    },

    carregamentoInicial: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240
    },

    carregamentoPaginacao: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center'
    },

    mes: {
        paddingTop: 20,
        paddingHorizontal: 18,
        paddingBottom: 18,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: cores.neutras.bordaClara
    },

    cabecalhoMes: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 18
    },

    nomeMes: {
        color: cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 22,
        lineHeight: 29
    },

    anoMes: {
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 18,
        lineHeight: 27
    },

    semana: {
        position: 'relative',
        flexDirection: 'row',
        width: '100%',
        height: 56,
        marginBottom: 8
    },

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

    trechoJanelaFertil: {
        position: 'absolute',
        top: -3,
        bottom: -3,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderRadius: 17,
        zIndex: 3
    },

    janelaFertilAtual: {
        borderColor: cores.neutras.textoSecundarioClaro
    },

    janelaFertilPrevista: {
        borderColor: 'rgba(92, 92, 89, 0.52)'
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