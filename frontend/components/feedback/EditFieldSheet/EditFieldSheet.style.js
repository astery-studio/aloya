import { StyleSheet } from 'react-native'
import { tema } from '../../../theme'

const estilos = StyleSheet.create({
    campo: {
        width: '100%',
        minHeight: 56,
        alignSelf: 'stretch',
        marginTop: 24,
        paddingHorizontal: 16,
        paddingVertical: 0,
        borderRadius: 12,
        borderWidth: 1.41,
        borderColor: tema.cores.marca.secundaria,
        backgroundColor:
            tema.cores.neutras.fundoClaro,
        color:
            tema.cores.neutras.textoPrincipalClaro,
        textAlignVertical: 'center',
        ...tema.typography.bodyDefault
    },

    campoData: {
        textAlign: 'center'
    },

    erro: {
        marginTop: tema.espacamentos.pequeno,
        color: tema.cores.feedback.erro,
        ...tema.typography.caption
    },

    espacoBotaoSalvar: {
        minHeight: 52,
        marginTop: tema.espacamentos.medio
    }
})

export { estilos }