import { StyleSheet } from 'react-native';
import { espacamentos, radius, shadows, typography } from '../../../shared/theme';

function criarEstilos(tema) {
    const corSelecionada = tema.escuro ? '#FFFFFF' : '#F7F5F0';

    return StyleSheet.create({
        container: {
            width: '100%',
            height: 94.33,
            paddingTop: 12,
            paddingHorizontal: espacamentos.pequeno
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
        dia_desconhecida: { backgroundColor: '#847F76', borderColor: '#847F76' },
        diaSelecionado: shadows.cardSuave,
        interior: {
            width: 42,
            height: 62,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            backgroundColor: '#FFFFFF'
        },
        interiorSelecionado: { backgroundColor: 'transparent' },
        semana: {
            ...typography.labelCompact,
            color: tema.escuro ? '#E1E1E1' : tema.cores.interface.textoSecundario,
            textTransform: 'capitalize',
            opacity: 0.7
        },
        textoNumero: {
            ...typography.numberCompact,
            color: tema.escuro ? '#E1E1E1' : tema.cores.interface.textoSecundario,
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
            backgroundColor: '#847F76'
        },
        indicador_menstrual: { backgroundColor: '#C85A44' },
        indicador_folicular: { backgroundColor: '#2C4C3B' },
        indicador_ovulatoria: { backgroundColor: '#4A758E' },
        indicador_lutea: { backgroundColor: '#D68C3A' },
        indicador_desconhecida: { backgroundColor: '#847F76' },
        indicadorHoje: { backgroundColor: tema.cores.interface.textoPrincipal },
        indicadorSelecionado: { backgroundColor: corSelecionada }
    });
}

export { criarEstilos };
