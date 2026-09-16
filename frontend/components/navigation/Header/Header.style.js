import { StyleSheet } from 'react-native'
import { tema, fontFamilies } from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%'
    },

    espacamentoSuperior: {
        height: 56
    },

    areaTitulo: {
        minHeight: 66,
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal:
            tema.espacamentosLayout.margemHorizontalTela,
        paddingBottom: 32
    },

    areaTituloComVoltar: {
        minHeight: 80,
        alignItems: 'center',
        paddingBottom: 32,
        paddingRight: tema.espacamentosLayout.margemHorizontalTela + 48
    },

    tituloComVoltar: {
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 27,
        textAlign: 'center'
    },

    titulo: {
        flex: 1,
        flexShrink: 1,
        ...tema.typography.h1,
        color: tema.cores.neutras.textoPrincipalClaro
    },

    containerVoltar: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

// Fornece ao ícone a cor definida no tema do aplicativo.
const corIconeVoltar = tema.cores.neutras.textoPrincipalClaro

export { estilos, corIconeVoltar }