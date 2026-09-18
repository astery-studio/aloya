import { StyleSheet } from 'react-native'
import { tema, fontFamilies } from '../../theme'

const estilos = StyleSheet.create({
    container: {
        flexShrink: 1
    },

    cabecalhoComAlca: {
        alignItems: 'center',
        paddingHorizontal:
            tema.espacamentosLayout.margemHorizontalTela
    },

    areaAlca: {
        width: 80,
        height: 44
    },

    toqueAlca: {
        width: '100%',
        height: '100%',
        paddingTop: 12,
        alignItems: 'center'
    },

    alca: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor:
            tema.cores.neutras.bordaClara
    },

    tituloCentral: {
        marginTop: -4,
        color:
            tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        lineHeight: 27,
        textAlign: 'center'
    },

    cabecalhoComFechar: {
        minHeight: 62,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        paddingHorizontal:
            tema.espacamentosLayout.margemHorizontalTela
    },

    tituloEsquerda: {
        flex: 1,
        color:
            tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        lineHeight: 27
    },

    botaoFechar: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },

    conteudo: {
        flexShrink: 1,
        paddingHorizontal:
            tema.espacamentosLayout.margemHorizontalTela
    }
})

const corIconeFechar = tema.cores.neutras.textoSecundarioClaro

export { estilos, corIconeFechar }