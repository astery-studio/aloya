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
    container: { width: '100%', alignItems: 'center' },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 35,
        textAlign: 'center'
    },
    dia: {
        marginTop: 4,
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center'
    },
    margemFertil: {
        width: '100%',
        maxWidth: 358,
        marginTop: 20
    },
    fertil: {
        minHeight: 67.67,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1.33333,
        borderStyle: 'dashed',
        borderRadius: 16
    },
    icone: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
        borderRadius: 12
    },
    tituloFertil: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 14,
        lineHeight: 21
    },
    textoFertil: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        lineHeight: 20
    }
});

export { CORES_FASE, estilos };
