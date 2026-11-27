import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const CORES_FASE = Object.freeze({
    menstrual: '#C85A44',
    folicular: '#2C4C3B',
    ovulatoria: '#4A758E',
    lutea: '#D68C3A',
    desconhecida: '#5C5C59'
});

const estilos = StyleSheet.create({
    container: { width: '100%', alignItems: 'center', paddingHorizontal: 16 },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 28,
        fontWeight: '700',
        includeFontPadding: false,
        lineHeight: 35,
        textAlign: 'center'
    },
    dia: {
        marginTop: 4,
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        includeFontPadding: false,
        lineHeight: 24,
        textAlign: 'center'
    }
});

export { CORES_FASE, estilos };
