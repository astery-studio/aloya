//Define a aparência do calendário e das listas de mês e ano
import { StyleSheet } from 'react-native'
import { fontFamilies, tema } from '../../../theme'

const estilos = StyleSheet.create({
    calendario: {
        width: '100%',
        alignSelf: 'center',
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

    tituloData: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    botaoTitulo: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        gap: 3
    },

    tituloMes: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        lineHeight: 27,
        includeFontPadding: false
    },

    linhaSemana: {
        width: '100%',
        flexDirection: 'row',
        marginBottom: tema.espacamentos.pequeno
    },

    casaSemana: {
        flex: 1,
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
        width: '100%'
    },

    linhaCalendario: {
        width: '100%',
        flexDirection: 'row'
    },

    casaDia: {
        flex: 1,
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
    },

    listaOpcoes: {
        height: 288,
        flexGrow: 0
    },

    opcaoLista: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },

    textoOpcao: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        includeFontPadding: false
    },

    textoOpcaoSelecionada: {
        color: tema.cores.marca.primaria,
        fontFamily: fontFamilies.bold
    },

    textoOpcaoDesabilitada: {
        color: tema.cores.neutras.bordaTracejada
    }
})

const corSeta = tema.cores.neutras.textoPrincipalClaro

export { estilos, corSeta }