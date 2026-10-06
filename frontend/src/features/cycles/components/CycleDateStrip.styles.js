import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    faixa: { gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
    dia: {
        width: 46,
        height: 74,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.7,
        borderColor: '#E6E2D8'
    },
    diaSelecionado: { backgroundColor: cores.marca.secundaria },
    semana: { color: '#5C5C59', fontFamily: fontFamilies.medium, fontSize: 11, lineHeight: 16, textTransform: 'capitalize' },
    textoNumero: { color: '#222222', fontFamily: fontFamilies.medium, fontSize: 17, lineHeight: 26 },
    textoSelecionado: { color: cores.neutras.superficieClara },
    indicador: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent' },
    indicadorHoje: { backgroundColor: '#222222' },
    indicadorSelecionado: { backgroundColor: '#FFFFFF' }
});

export { estilos };
