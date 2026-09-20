//Define a aparência das três variantes do NavigationField.
import { StyleSheet } from 'react-native'
import { fontFamilies, tema } from '../../../theme'

const corSeta = tema.cores.neutras.bordaTracejada
const corSetaBotao = tema.cores.neutras.textoSecundarioClaro

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        backgroundColor: tema.cores.neutras.superficieClara,
        borderWidth: 1,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: tema.radius.buttonAndInput
    },

    semBorda: {
        borderWidth: 0,
        paddingHorizontal: 13
    },

    botao: {
        paddingHorizontal: 14,
        paddingVertical: 11
    },

    desabilitado: {
        opacity: 0.5
    },

    caixaIcone: {
        width: 36,
        height: 36,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12
    },

    caixaIconeBotao: {
        width: 32,
        height: 32,
        borderRadius: 8
    },

    label: {
        flex: 1,
        minWidth: 0,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        includeFontPadding: false
    }
})

export {
    estilos,
    corSeta,
    corSetaBotao
}