import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../theme';

const cores = Object.freeze({
    aviso: '#B07D2A',
    informacao: '#4A758E',
    sucesso: '#2C4C3B'
});

const base = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: 99
};

const textoPadrao = {
    height: 17,
    fontFamily: fontFamilies.semibold,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 16
};

const containerUso = {
    height: 23,
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexGrow: 1,
    borderRadius: 99
};

const estilos = StyleSheet.create({
    container: base,
    ponto: {
        width: 9,
        height: 14,
        flexShrink: 0,
        fontFamily: fontFamilies.regular,
        fontWeight: '400',
        fontSize: 9,
        lineHeight: 14,
        textAlign: 'center'
    },
    texto: { flexShrink: 0 },
    conteudoEstimativa: {
        width: 226.68,
        height: 33,
        alignItems: 'center'
    },
    tituloEstimativa: {
        alignSelf: 'stretch',
        height: 17,
        fontFamily: fontFamilies.bold,
        fontWeight: '700',
        fontSize: 13,
        lineHeight: 17,
        color: cores.aviso
    },
    descricaoEstimativa: {
        width: 228,
        height: 15,
        fontFamily: fontFamilies.regular,
        fontWeight: '400',
        fontSize: 11,
        lineHeight: 14,
        color: cores.aviso
    }
});

const variantes = Object.freeze({
    pendenteDeUso: {
        container: {
            ...containerUso,
            width: 152.6,
            backgroundColor: '#FBF3E0'
        },
        texto: { ...textoPadrao, width: 90, color: cores.aviso }
    },
    alertaModerado: {
        container: {
            ...containerUso,
            width: 152.6,
            backgroundColor: 'rgba(74, 117, 142, 0.2)'
        },
        texto: { ...textoPadrao, width: 90, color: cores.informacao }
    },
    alertaLeve: {
        container: {
            ...containerUso,
            width: 152.6,
            backgroundColor: 'rgba(74, 117, 142, 0.2)'
        },
        texto: { ...textoPadrao, width: 60, color: cores.informacao }
    },
    atrasadoProximosHorarios: {
        container: {
            width: 60,
            height: 17,
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingVertical: 1,
            paddingHorizontal: 7,
            backgroundColor: '#FBF3E0',
            borderRadius: 99
        },
        texto: {
            width: 46,
            height: 15,
            color: cores.aviso,
            fontFamily: fontFamilies.bold,
            fontWeight: '700',
            fontSize: 10,
            lineHeight: 15
        }
    },
    confirmado: {
        container: {
            ...containerUso,
            width: 155.31,
            backgroundColor: 'rgba(44, 76, 59, 0.1)'
        },
        texto: { ...textoPadrao, width: 63, color: cores.sucesso }
    },
    alertaCritico: {
        container: {
            ...containerUso,
            width: 155.31,
            backgroundColor: 'rgba(74, 117, 142, 0.2)'
        },
        texto: { ...textoPadrao, width: 72, color: cores.informacao }
    },
    confirmadoHistoricoUso: {
        container: {
            width: 81,
            height: 23,
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingVertical: 3,
            paddingHorizontal: 9,
            backgroundColor: 'rgba(44, 76, 59, 0.1)',
            borderRadius: 99
        },
        texto: { ...textoPadrao, width: 63, color: cores.sucesso }
    },
    confirmadoForaPrazoHistoricoUso: {
        container: {
            width: 155,
            height: 23,
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingVertical: 3,
            paddingHorizontal: 9,
            backgroundColor: 'rgba(214, 140, 58, 0.1)',
            borderRadius: 99
        },
        texto: { ...textoPadrao, width: 137, color: '#D68C3A' }
    },
    naoConfirmadoHistoricoUso: {
        container: {
            width: 104,
            height: 23,
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingVertical: 3,
            paddingHorizontal: 9,
            backgroundColor: '#E6E2D8',
            borderRadius: 99
        },
        texto: { ...textoPadrao, width: 86, color: '#5C5C59' }
    },
    validadeAindaPrazo: {
        container: {
            width: 133,
            height: 22,
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingVertical: 2,
            paddingHorizontal: 8,
            backgroundColor: '#EEF4F0',
            borderRadius: 99
        },
        texto: {
            width: 117,
            height: 18,
            color: cores.sucesso,
            fontFamily: fontFamilies.bold,
            fontWeight: '700',
            fontSize: 12,
            lineHeight: 18
        }
    },
    diasMenstruacao: {
        container: {
            width: 143.41,
            height: 30.88,
            gap: 6,
            paddingVertical: 5,
            paddingHorizontal: 12,
            borderWidth: 0.70489,
            borderColor: 'rgba(200, 90, 68, 0.6)',
            borderRadius: 999
        },
        texto: {
            width: 38,
            height: 20,
            color: '#C85A44',
            fontFamily: fontFamilies.semibold,
            fontWeight: '600',
            fontSize: 13,
            lineHeight: 20
        },
        sufixo: {
            width: 74,
            height: 18,
            color: '#C85A44',
            fontFamily: fontFamilies.regular,
            fontWeight: '400',
            fontSize: 12,
            lineHeight: 18
        }
    },
    diasCiclo: {
        container: {
            width: 146,
            height: 30.88,
            gap: 6,
            paddingVertical: 5,
            paddingHorizontal: 12,
            borderWidth: 0.70489,
            borderColor: 'rgba(44, 76, 59, 0.6)',
            borderRadius: 999
        },
        texto: {
            width: 45,
            height: 20,
            color: cores.sucesso,
            fontFamily: fontFamilies.semibold,
            fontWeight: '600',
            fontSize: 13,
            lineHeight: 20
        },
        sufixo: {
            width: 27,
            height: 18,
            color: cores.sucesso,
            fontFamily: fontFamilies.regular,
            fontWeight: '400',
            fontSize: 12,
            lineHeight: 18
        }
    },
    estimativaIncerta: {
        container: {
            width: 316.62,
            height: 52.41,
            justifyContent: 'flex-start',
            gap: 15,
            paddingVertical: 9,
            paddingHorizontal: 12,
            backgroundColor: '#FBF3E0',
            borderWidth: 0.70489,
            borderColor: 'rgba(214, 140, 58, 0.3)',
            borderRadius: 10
        },
        texto: { color: cores.aviso }
    }
});

export { estilos, variantes };
