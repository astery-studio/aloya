import { StyleSheet } from 'react-native';
import { espacamentos, radius, shadows, typography } from '../../../shared/theme';

function criarEstilos(tema) {
    const corSelecionada = tema.escuro ? '#FFFFFF' : '#F7F5F0';

    return StyleSheet.create({
        container: {
            width: '100%',
            height: 82.33
        },
        faixa: {
            gap: espacamentos.pequeno,
            paddingHorizontal: espacamentos.pequeno,
            paddingVertical: espacamentos.minimo
        },
        dia: {
            width: 46,
            height: 74.33,
            alignItems: 'center',
            paddingTop: 2,
            borderRadius: radius.onboardingCalendar,
            borderWidth: 0.666667
        },
        dia_menstrual: { backgroundColor: '#C85A44', borderColor: '#C85A44' },
        dia_folicular: { backgroundColor: '#2C4C3B', borderColor: '#2C4C3B' },
        dia_ovulatoria: { backgroundColor: '#4A758E', borderColor: '#4A758E' },
        dia_lutea: { backgroundColor: '#D68C3A', borderColor: '#D68C3A' },
        dia_desconhecida: { backgroundColor: '#FFFFFF', borderColor: '#E6E2D8' },
        diaSelecionado: { ...shadows.cardSuave, paddingTop: 10 },
        diaSelecionadoDesconhecida: {
            backgroundColor: '#5C5C59',
            borderColor: '#E6E2D8'
        },
        interior: {
            width: 42,
            height: 62,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            backgroundColor: '#FFFFFF'
        },
        interiorSelecionado: {
            height: 54,
            justifyContent: 'flex-start',
            backgroundColor: 'transparent'
        },
        semana: {
            ...typography.labelCompact,
            color: tema.escuro ? '#E1E1E1' : tema.cores.interface.textoSecundario,
            includeFontPadding: false,
            textTransform: 'capitalize'
        },
        textoNumero: {
            ...typography.numberCompact,
            color: tema.escuro ? '#E1E1E1' : tema.cores.interface.textoSecundario,
            includeFontPadding: false,
            marginTop: 2
        },
        semanaSelecionada: { color: tema.escuro ? '#E3E3E3' : corSelecionada, opacity: 0.85 },
        numeroSelecionado: {
            ...typography.numberCompactStrong,
            color: tema.escuro ? '#E3E3E3' : corSelecionada
        },
        indicador: {
            width: 5,
            height: 5,
            marginTop: espacamentos.minimo,
            borderRadius: 3,
            backgroundColor: 'transparent'
        },
        indicadorHoje: { backgroundColor: tema.cores.interface.textoPrincipal },
        indicadorSelecionado: { backgroundColor: 'transparent' },
        indicadorHojeSelecionado: { backgroundColor: corSelecionada }
    });
}

export { criarEstilos };
