import {StyleSheet} from 'react-native'
import {tema} from '../../../../shared/theme/theme'

const COR_TEXTO = '#222222'
const COR_TEXTO_SECUNDARIO = '#5C5C59'
const COR_DIVISAO = '#EDEAE4'
const COR_JANELA_FERTIL = 'rgba(34, 34, 34, 0.70)'

export const estilos = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: tema.cores.fundo
    },
    cabecalhoSemana: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 10
    },
    nomeDiaSemana: {
        flex: 1,
        color: COR_TEXTO_SECUNDARIO,
        fontFamily: tema.fontes.familia,
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 18,
        textAlign: 'center'
    },
    lista: {
        flex: 1
    },
    conteudoLista: {
        paddingBottom: 24
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
        color: COR_TEXTO,
        fontFamily: tema.fontes.familia,
        fontSize: 15,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 22.5
    },
    anoMes: {
        color: COR_TEXTO_SECUNDARIO,
        fontFamily: tema.fontes.familia,
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 18
    },
    divisorMes: {
        alignSelf: 'stretch',
        height: 0.991,
        marginTop: 8,
        backgroundColor: COR_DIVISAO
    },
    semana: {
        position: 'relative',
        flexDirection: 'row',
        height: 53.99
    },
    celulaDia: {
        position: 'relative',
        flex: 1,
        height: 53.99,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start'
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
    segmentoPrevisto: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(34, 34, 34, 0.42)'
    },
    menstruacaoAtual: {
        backgroundColor: 'rgba(200, 90, 68, 0.90)'
    },
    menstruacaoPrevista: {
        backgroundColor: 'rgba(200, 90, 68, 0.58)'
    },
    folicularAtual: {
        backgroundColor: 'rgba(44, 76, 59, 0.90)'
    },
    folicularPrevista: {
        backgroundColor: 'rgba(44, 76, 59, 0.58)'
    },
    ovulatoriaAtual: {
        backgroundColor: 'rgba(74, 117, 142, 0.90)'
    },
    ovulatoriaPrevista: {
        backgroundColor: 'rgba(74, 117, 142, 0.58)'
    },
    luteaAtual: {
        backgroundColor: 'rgba(214, 140, 58, 0.90)'
    },
    luteaPrevista: {
        backgroundColor: 'rgba(214, 140, 58, 0.58)'
    },
    conteudoDia: {
        zIndex: 2,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    containerIconeDia: {
        flexDirection: 'row',
        width: '100%',
        height: 10.992,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    numeroDia: {
        color: 'rgba(34, 34, 34, 0.70)',
        textAlign: 'center',
        fontFamily: tema.fontes.familia,
        fontSize: 13,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 13
    },
    numeroDiaFuturo: {
        color: 'rgba(34, 34, 34, 0.28)'
    },
    numeroDiaMarcado: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: tema.fontes.familia,
        fontSize: 13,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 13
    },
    trechoJanelaFertil: {
        position: 'absolute',
        zIndex: 3,
        top: 0,
        bottom: 0,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderStyle: 'dashed',
        borderColor: COR_JANELA_FERTIL,
        borderRadius: 16
    },
    trechoJanelaFertilPrevisto: {
        borderColor: 'rgba(34, 34, 34, 0.42)'
    },
    carregamentoCentral: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32
    },
    carregamentoPaginacao: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center'
    }
})