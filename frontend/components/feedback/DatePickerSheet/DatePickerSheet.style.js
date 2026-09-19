import { StyleSheet } from 'react-native'
import { fontFamilies, tema } from '../../../theme'

const estilos = StyleSheet.create({
    calendario: {
        paddingTop: tema.espacamentos.grande,
        paddingBottom: tema.espacamentos.medio
    },

    navegacao: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tema.espacamentos.grande
    },

    botaoNavegacao: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },

    tituloMes: {
        flex: 1,
        textAlign: 'center',
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        lineHeight: 27,
        includeFontPadding: false
    },

    linhaSemana: {
        flexDirection: 'row',
        marginBottom: tema.espacamentos.pequeno
    },

    casaSemana: {
        width: '14.285714%',
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center'
    },

    textoSemana: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        lineHeight: 20,
        includeFontPadding: false
    },

    grade: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    casaDia: {
        width: '14.285714%',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },

    botaoDia: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },

    botaoDiaSelecionado: {
        backgroundColor: tema.cores.marca.primaria
    },

    textoDia: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        includeFontPadding: false
    },

    textoDiaSelecionado: {
        color: tema.cores.neutras.superficieClara,
        fontFamily: fontFamilies.bold
    },

    textoDiaDesabilitado: {
        color: tema.cores.neutras.bordaTracejada
    }
})

const corSeta = tema.cores.neutras.textoPrincipalClaro

export { estilos, corSeta }