import { StyleSheet } from 'react-native'
import { tema } from '../../theme'

const estilos = StyleSheet.create({
    lista: {
        flexGrow: 0,
        marginTop: tema.espacamentos.grande
    },

    listaLarga: {
        marginTop: 0,
        marginHorizontal: -8
    },

    conteudoLista: {
        paddingBottom: tema.espacamentos.pequeno
    },

    mensagemVazia: {
        paddingVertical: tema.espacamentos.grande,
        color:
            tema.cores.neutras.textoSecundarioClaro,
        ...tema.typography.bodyDefault
    }
})

export { estilos }