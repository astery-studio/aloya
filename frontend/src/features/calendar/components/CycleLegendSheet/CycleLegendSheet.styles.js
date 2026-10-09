import {StyleSheet} from 'react-native'
import {fontFamilies} from '../../../../shared/theme'

const cores = Object.freeze({
    menstruacao: '#C85A44',
    folicular: '#2C4C3B',
    ovulacao: '#4A756E',
    lutea: '#D68C3A',
    janelaFertil: 'rgba(34, 34, 34, 0.70)',
    janelaFertilPrevista: 'rgba(34, 34, 34, 0.42)',
    texto: '#222222',
    descricao: '#5C5C59',
    fundo: '#FFFFFF'
})

const estilos = StyleSheet.create({
    lista: {
        width: '100%',
        height: 309,
        flexShrink: 0
    },
    listaConteudo: {
        paddingTop: 20,
        paddingBottom: 16,
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16
    },
    item: {
        display: 'flex',
        width: '100%',
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        alignSelf: 'stretch'
    },
    marcador: {
        display: 'flex',
        width: 48,
        height: 28,
        flexShrink: 0,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        borderRadius: 16
    },
    icone: {
        height: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    diaMarcado: {
        color: cores.fundo,
        fontFamily: fontFamilies.regular,
        fontSize: 10,
        lineHeight: 12
    },
    marcadorJanela: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        backgroundColor: cores.fundo
    },
    diaJanela: {
        color: cores.texto,
        fontFamily: fontFamilies.medium,
        fontSize: 10,
        lineHeight: 12
    },
    textos: {
        display: 'flex',
        width: 178,
        flexShrink: 0,
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    nome: {
        color: cores.texto,
        fontFamily: fontFamilies.semibold,
        fontSize: 15,
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 22.5
    },
    descricao: {
        color: cores.descricao,
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 19.5
    }
})

const fundosReais = Object.freeze({
    menstruacao: 'rgba(200, 90, 68, 0.90)',
    folicular: 'rgba(44, 76, 59, 0.90)',
    ovulacao: 'rgba(74, 117, 142, 0.90)',
    lutea: 'rgba(214, 140, 58, 0.90)'
})

const fundosPrevistos = Object.freeze({
    menstruacao: 'rgba(200, 90, 68, 0.58)',
    folicular: 'rgba(44, 76, 59, 0.56)',
    ovulacao: 'rgba(74, 117, 142, 0.56)',
    lutea: 'rgba(214, 140, 58, 0.58)'
})

export {cores, estilos, fundosPrevistos, fundosReais}
