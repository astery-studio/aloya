import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../theme';

const base = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: 99
};

const textoPadrao = {
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    lineHeight: 16
};

const estilos = StyleSheet.create({
    container: base,
    ponto: { width: 6, height: 6, flexShrink: 0, borderRadius: 3 },
    texto: { flexShrink: 1 }
});

const variantes = Object.freeze({
    aviso: {
        container: { minHeight: 23, gap: 3, paddingVertical: 3, paddingHorizontal: 8, backgroundColor: '#FBF3E0' },
        texto: { ...textoPadrao, color: '#B07D2A' }
    },
    informacao: {
        container: { minHeight: 23, gap: 3, paddingVertical: 3, paddingHorizontal: 8, backgroundColor: 'rgba(74, 117, 142, 0.2)' },
        texto: { ...textoPadrao, color: '#4A758E' }
    },
    atrasado: {
        container: { height: 17, paddingVertical: 1, paddingHorizontal: 7, backgroundColor: '#FBF3E0' },
        texto: { color: '#B07D2A', fontFamily: fontFamilies.bold, fontSize: 10, lineHeight: 15 }
    },
    sucesso: {
        container: { minHeight: 23, gap: 3, paddingVertical: 3, paddingHorizontal: 8, backgroundColor: 'rgba(44, 76, 59, 0.1)' },
        texto: { ...textoPadrao, color: '#2C4C3B' }
    },
    sucessoCompacto: {
        container: { height: 23, paddingVertical: 3, paddingHorizontal: 9, backgroundColor: 'rgba(44, 76, 59, 0.1)' },
        texto: { ...textoPadrao, color: '#2C4C3B' }
    },
    foraDoPrazo: {
        container: { height: 23, paddingVertical: 3, paddingHorizontal: 9, backgroundColor: 'rgba(214, 140, 58, 0.1)' },
        texto: { ...textoPadrao, color: '#D68C3A' }
    },
    neutro: {
        container: { height: 23, paddingVertical: 3, paddingHorizontal: 9, backgroundColor: '#E6E2D8' },
        texto: { ...textoPadrao, color: '#5C5C59' }
    },
    validade: {
        container: { height: 22, paddingVertical: 2, paddingHorizontal: 8, backgroundColor: '#EEF4F0' },
        texto: { color: '#2C4C3B', fontFamily: fontFamilies.bold, fontSize: 12, lineHeight: 18 }
    },
    menstruacao: {
        container: { height: 30.88, gap: 6, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 0.70489, borderColor: 'rgba(200, 90, 68, 0.6)' },
        texto: { color: '#C85A44', fontFamily: fontFamilies.semibold, fontSize: 13, lineHeight: 20 },
        sufixo: { color: '#C85A44', fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 18 }
    },
    ciclo: {
        container: { height: 30.88, gap: 6, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 0.70489, borderColor: 'rgba(44, 76, 59, 0.6)' },
        texto: { color: '#2C4C3B', fontFamily: fontFamilies.semibold, fontSize: 13, lineHeight: 20 },
        sufixo: { color: '#2C4C3B', fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 18 }
    }
});

export { estilos, variantes };
