import { StyleSheet } from 'react-native'
import { tema, fontFamilies } from '../../theme'

const estilos = StyleSheet.create({
    container: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: tema.espacamentos.pequeno,
        marginBottom: 2,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: tema.radius.buttonAndInput
    },

    selecionado: {
        backgroundColor:
            `${tema.cores.marca.secundaria}0D`
    },

    desabilitado: {
        opacity: 0.5
    },

    textos: {
        flex: 1
    },

    label: {
        color:
            tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24
    },

    labelSelecionado: {
        color: tema.cores.marca.secundaria,
        fontFamily: fontFamilies.bold
    },

    descricao: {
        marginTop: 4,
        color:
            tema.cores.neutras.textoSecundarioClaro,
        ...tema.typography.caption
    }
})

const corIconeNormal = tema.cores.neutras.textoPrincipalClaro
const corIconeSelecionado = tema.cores.marca.secundaria

export { estilos, corIconeNormal, corIconeSelecionado }