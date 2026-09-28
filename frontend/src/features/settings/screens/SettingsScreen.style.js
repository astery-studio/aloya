//Define o visual do menu principal de configurações conforme o protótipo.
import {StyleSheet} from 'react-native'

import {fontFamilies, tema} from '../../theme'

const coresSwitch = Object.freeze({
    trilhaInativa: tema.cores.neutras.bordaTracejada,
    trilhaAtiva: tema.cores.marca.secundaria,
    botao: tema.cores.neutras.superficieClara
})

const estilos = StyleSheet.create({
    conteudo: {
        flexGrow: 1,
        gap: tema.espacamentos.extraGrande,
        paddingHorizontal: tema.espacamentos.grande,
        paddingBottom: tema.espacamentos.extraGrande
    },

    secao: {
        width: '100%',
        gap: 10
    },

    tituloSecao: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.medium,
        fontSize: 16,
        lineHeight: 24,
        includeFontPadding: false
    },

    grupo: {
        width: '100%',
        overflow: 'hidden',
        backgroundColor: tema.cores.neutras.superficieClara,
        borderWidth: 0.7,
        borderColor: tema.cores.neutras.bordaClara,
        borderRadius: tema.radius.buttonAndInput
    },

    linhaSwitch: {
        width: '100%',
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 13,
        paddingVertical: 9,
        backgroundColor: tema.cores.neutras.superficieClara
    },

    caixaIconeModoNoturno: {
        width: 36,
        height: 36,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tema.cores.icones.configuracoes.azul.caixa,
        borderRadius: 10
    },

    label: {
        flex: 1,
        minWidth: 0,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        includeFontPadding: false
    },

    separador: {
        height: 0.7,
        marginLeft: 61,
        backgroundColor: tema.cores.neutras.bordaClara
    },

    desabilitado: {
        opacity: 0.5
    }
})

export {coresSwitch, estilos}