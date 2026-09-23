//Define somente a estrutura visual necessária para inicializar o aplicativo.
import { StyleSheet } from 'react-native'
import { fontFamilies, tema } from './theme'

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    estadoInicial: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    tituloEstado: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        lineHeight: 27,
        textAlign: 'center'
    },

    textoEstado: {
        marginTop: tema.espacamentos.pequeno,
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center'
    }
})

export { estilos }