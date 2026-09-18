import { StyleSheet } from 'react-native'
import { tema } from '../../../theme'

const estilos = StyleSheet.create({
    campo: {
        minHeight: 56,
        marginTop: 24,
        paddingHorizontal: tema.espacamentos.medio,
        borderWidth: 1,
        borderColor: tema.cores.marca.secundaria,
        borderRadius: tema.radius.buttonAndInput,
        backgroundColor:
            tema.cores.neutras.superficieClara,
        color:
            tema.cores.neutras.textoPrincipalClaro,
        ...tema.typography.bodyDefault
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