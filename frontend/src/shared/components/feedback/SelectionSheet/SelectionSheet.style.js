import { StyleSheet } from 'react-native'
import { tema } from '../../../theme'

const estilos = StyleSheet.create({
    lista: {
        flexGrow: 0,
        marginHorizontal: -8
    },

    conteudoLista: {
        paddingBottom: tema.espacamentos.pequeno
    },

    mensagemVazia: {
        ...tema.typography.bodyDefault,
        paddingVertical: tema.espacamentos.grande,
        color: tema.cores.neutras.textoSecundarioClaro
    }
})

export { estilos }
