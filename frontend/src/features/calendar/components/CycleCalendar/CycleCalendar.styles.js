//Centraliza os estilos visuais dos componentes do calendário.
import {StyleSheet} from 'react-native'
import {cores, fontFamilies} from '../../../../shared/theme'

const COR_JANELA_FERTIL = 'rgba(34, 34, 34, 0.70)'

const estilos = StyleSheet.create({
    calendario: {
        flex: 1,
        backgroundColor: cores.neutras.fundoClaro
    },
    cabecalhoSemana: {
        flexDirection: 'row',
        paddingHorizontal: 8,
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
        paddingHorizontal: 8
    },
    cabecalhoMes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5.375,
        alignSelf: 'stretch',
        marginHorizontal: 7.992,
        paddingTop: 15.992,
        paddingBottom: 3.499,
        marginBottom: 8
    },
    nomeMes: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 15,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 22.5
    },
    anoMes: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 18
    },
    divisorMes: {
        alignSelf: 'stretch',
        height: 0.991,
        marginTop: 8,
        backgroundColor: '#EDEAE4'
    },
    semana: {
        position: 'relative',
        flexDirection: 'row',
        width: '100%',
        height: 53.99
    },
    celulaDia: {
        flex: 1,
        height: 53.99,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start'
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
        top: 3.998,
        right: 0,
        bottom: 3.998,
        left: 0
    },
    inicioSegmento: {
        left: 4.273,
        borderTopLeftRadius: 99,
        borderBottomLeftRadius: 99
    },
    fimSegmento: {
        right: 4.273,
        borderTopRightRadius: 99,
        borderBottomRightRadius: 99
    },
    iconeDia: {
        flexDirection: 'row',
        width: '100%',
        height: 10.992,
        marginBottom: 3,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    numeroDia: {
        color: 'rgba(34, 34, 34, 0.70)',
        textAlign: 'center',
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 13
    },
    numeroDiaMarcado: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 13
    },
    numeroDiaFuturo: {
        color: 'rgba(34, 34, 34, 0.28)'
    },
    trechoJanelaFertil: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        zIndex: 3
    },
    janelaFertilAtual: {
        borderColor: COR_JANELA_FERTIL
    },
    janelaFertilPrevista: {
        borderColor: 'rgba(34, 34, 34, 0.42)'
    },
    pressionado: {
        opacity: 0.72
    }
})

const estilosTipos = StyleSheet.create({
    menstruacao: {
        backgroundColor: 'rgba(200, 90, 68, 0.90)'
    },
    folicular: {
        backgroundColor: 'rgba(44, 76, 59, 0.90)'
    },
    ovulacao: {
        backgroundColor: 'rgba(74, 117, 142, 0.90)'
    },
    lutea: {
        backgroundColor: 'rgba(214, 140, 58, 0.90)'
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

export {estilos, estilosTipos, estilosTiposPrevistos}