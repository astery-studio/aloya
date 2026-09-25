//Define o visual das permissões individuais exibidas dentro dos grupos.
import {StyleSheet} from 'react-native'
import {fontFamilies, tema} from '../../../theme'

const estilos = StyleSheet.create({
    container: {
        minHeight: 52,
        paddingLeft: 58,
        paddingRight: 16,
        paddingVertical: 6,
        gap: 12,
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderRadius: 0
    },

    titulo: {
        fontSize: 15,
        lineHeight: 22,
        includeFontPadding: false
    },

    tituloAtivo: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.medium,
        fontWeight: '500'
    },

    tituloInativo: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontWeight: '400'
    }
})

const fundosAtivos = StyleSheet.create({
    ciclo: {
        backgroundColor: tema.cores.redeApoio.ciclo.fundoExpandido
    },

    corpo: {
        backgroundColor: tema.cores.redeApoio.corpo.fundoExpandido
    },

    emocional: {
        backgroundColor: tema.cores.redeApoio.emocional.fundoExpandido
    },

    energia: {
        backgroundColor: tema.cores.redeApoio.energia.fundoExpandido
    },

    vidaIntima: {
        backgroundColor: tema.cores.redeApoio.vidaIntima.fundoExpandido
    },

    saude: {
        backgroundColor: tema.cores.redeApoio.saude.fundoExpandido
    }
})

export {estilos, fundosAtivos}