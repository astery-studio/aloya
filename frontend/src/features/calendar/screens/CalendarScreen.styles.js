// Define o layout do conteúdo e dos estados da tela de calendário.
import {StyleSheet} from 'react-native'
import {cores, fontFamilies} from '../../../shared/theme'

const estilos = StyleSheet.create({
    conteudo: {
        flex: 1,
        backgroundColor: cores.neutras.fundoClaro
    },
    linhaConfianca: {
        minHeight: 44,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    botaoLegenda: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center'
    },
    corInfo: cores.neutras.textoSecundarioClaro,
    areaCalendario: {
        flex: 1,
        minHeight: 0
    },
    avisoVazio: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(214, 140, 58, 0.14)'
    },
    textoVazio: {
        color: cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 21
    },
    areaAcao: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12
    }
})

export {estilos}