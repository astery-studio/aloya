import { StyleSheet } from 'react-native'
import { tema } from '../../../theme'

const estilos = StyleSheet.create({
    campo: {
        ...tema.typography.bodyDefault,
        width: '100%',
        height: 56,
        marginTop: 24,
        paddingHorizontal: 16,
        paddingVertical: 0,
        borderRadius: 12,
        borderWidth: 1.41,
        borderColor: tema.cores.marca.secundaria,
        backgroundColor: tema.cores.neutras.fundoClaro,
        color: tema.cores.neutras.textoPrincipalClaro,
        textAlignVertical: 'center',
        includeFontPadding: false
    },

    caixaData: {
        width: '100%',
        height: 56,
        marginTop: 24,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1.41,
        borderColor: tema.cores.marca.secundaria,
        backgroundColor: tema.cores.neutras.fundoClaro
    },

    parteData: {
        ...tema.typography.bodyDefault,
        height: 52,
        padding: 0,
        color: tema.cores.neutras.textoPrincipalClaro,
        textAlignVertical: 'center',
        includeFontPadding: false
    },

    diaMes: {
        width: 30
    },

    ano: {
        width: 54
    },

    barraData: {
        ...tema.typography.bodyDefault,
        color: tema.cores.neutras.textoPrincipalClaro
    },

    erro: {
        ...tema.typography.caption,
        marginTop: tema.espacamentos.pequeno,
        color: tema.cores.feedback.erro
    },

    espacoBotaoSalvar: {
        minHeight: 52,
        marginTop: tema.espacamentos.medio
    }
})

export { estilos }