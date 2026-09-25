import { StyleSheet } from 'react-native'
import { tema, fontFamilies } from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        width: '100%'
    },

    espacamentoSuperior: {
        height: 56
    },

    espacamentoSuperiorComVoltar: {
        height: 48
    },

    areaTitulo: {
        minHeight: 66,
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela,
        paddingBottom: 32
    },

    areaTituloComVoltar: {
        minHeight: 72,
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 60,
        paddingBottom: 24
    },

    titulo: {
        flex: 1,
        flexShrink: 1,
        ...tema.typography.h1,
        color: tema.cores.neutras.textoPrincipalClaro
    },

    tituloComVoltar: {
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 27,
        textAlign: 'center'
    },

    containerVoltar: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

const corIconeVoltar = tema.cores.neutras.textoSecundarioClaro

export { estilos, corIconeVoltar }