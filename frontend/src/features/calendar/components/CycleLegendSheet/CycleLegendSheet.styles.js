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
    fundo: '#FFFFFF',
    puxador: '#E8E3D9'
})

const estilos = StyleSheet.create({
    painel: {
        flexShrink: 1,
        maxHeight: '90%',
        paddingTop: 8
    },
    puxador: {
        width: 58,
        height: 5,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 22,
        borderRadius: 4,
        backgroundColor: cores.puxador
    },
    cabecalho: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 16,
        marginBottom: 14
    },
    titulo: {
        flex: 1,
        color: cores.texto,
        fontFamily: fontFamilies.bold,
        fontSize: 24,
        lineHeight: 32
    },
    botaoFechar: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    lista: {
        flexShrink: 1
    },
    listaConteudo: {
        paddingHorizontal: 24,
        paddingTop: 4,
        paddingBottom: 28
    },
    item: {
        minHeight: 80,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16
    },
    marcador: {
        width: 78,
        height: 47,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        borderRadius: 24
    },
    icone: {
        height: 13,
        alignItems: 'center',
        justifyContent: 'center'
    },
    diaMarcado: {
        color: cores.fundo,
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 15
    },
    marcadorJanela: {
        borderWidth: 2,
        borderStyle: 'dashed',
        backgroundColor: cores.fundo
    },
    diaJanela: {
        color: cores.texto,
        fontFamily: fontFamilies.medium,
        fontSize: 12,
        lineHeight: 16
    },
    textos: {
        flex: 1,
        gap: 5
    },
    nome: {
        color: cores.texto,
        fontFamily: fontFamilies.semibold,
        fontSize: 18,
        lineHeight: 24
    },
    descricao: {
        color: cores.descricao,
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 23
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