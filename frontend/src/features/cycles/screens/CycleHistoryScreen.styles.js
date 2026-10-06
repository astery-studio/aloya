//Organiza os estados da tela sem interferir nos estilos internos dos cards reutilizados.
import {StyleSheet} from 'react-native'

import {fontFamilies, tema} from '../../../shared/theme'

const estilos = StyleSheet.create({
    conteudoEstatico: {
        flex: 1,
        minHeight: 0,
        paddingHorizontal: 22,
        paddingBottom: tema.espacamentos.grande
    },

    estadoCentralizado: {
        flex: 1,
        minHeight: 260,
        alignItems: 'center',
        justifyContent: 'center',
        gap: tema.espacamentos.pequeno,
        paddingBottom: tema.espacamentos.maximo
    },

    tituloDoEstado: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 27,
        textAlign: 'center',
        includeFontPadding: false
    },

    mensagemDoEstado: {
        maxWidth: 340,
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 24,
        textAlign: 'center',
        includeFontPadding: false
    },

    botaoDoEstado: {
        width: '100%',
        marginTop: tema.espacamentos.extraGrande
    },

    conteudoDaLista: {
        paddingHorizontal: 22,
        paddingBottom: tema.espacamentos.grande
    },

    cabecalhoDaLista: {
        width: '100%',
        gap: tema.espacamentos.extraGrande,
        paddingBottom: tema.espacamentos.grande
    },

    divisorDaLista: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: tema.espacamentos.pequeno
    },

    linhaDoDivisor: {
        flex: 1,
        height: 1,
        backgroundColor: tema.cores.neutras.bordaClara
    },

    textoDoDivisor: {
        flexShrink: 0,
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 18,
        letterSpacing: 0.5,
        includeFontPadding: false
    },

    itemDaLista: {
        width: '100%',
        marginBottom: 12
    }
})

export {estilos}