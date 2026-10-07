import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    container: { width: '100%', height: 94.33, paddingTop: 12, paddingHorizontal: 8 },
    faixa: { gap: 8, paddingHorizontal: 8, paddingVertical: 4 },
    dia: {
        width: 46,
        height: 74.33,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.666667,
        borderColor: '#E6E2D8',
    },
    diaSelecionado: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 1
    },
    diaSelecionado_menstrual: { backgroundColor: '#C85A44', borderColor: '#C85A44' },
    diaSelecionado_folicular: { backgroundColor: '#2C4C3B', borderColor: '#2C4C3B' },
    diaSelecionado_ovulatoria: { backgroundColor: '#4A758E', borderColor: '#4A758E' },
    diaSelecionado_lutea: { backgroundColor: '#D68C3A', borderColor: '#D68C3A' },
    diaSelecionado_desconhecida: { backgroundColor: '#5C5C59' },
    semana: { color: '#5C5C59', fontFamily: fontFamilies.medium, fontSize: 11, lineHeight: 16, textTransform: 'capitalize', opacity: 0.7 },
    textoNumero: { color: '#5C5C59', fontFamily: fontFamilies.medium, fontSize: 17, lineHeight: 26, marginTop: 2 },
    semanaSelecionada: { color: cores.neutras.fundoClaro, opacity: 0.85 },
    numeroSelecionado: { color: cores.neutras.fundoClaro, fontFamily: fontFamilies.bold },
    textoSelecionadoDesconhecido: { color: '#FFFFFF' },
    indicador: { width: 5, height: 5, marginTop: 4, borderRadius: 3, backgroundColor: 'transparent' },
    indicadorHoje: { backgroundColor: '#222222' },
    indicadorSelecionado: { backgroundColor: cores.neutras.fundoClaro },
    indicadorSelecionadoDesconhecido: { backgroundColor: '#FFFFFF' }
});

export { estilos };
