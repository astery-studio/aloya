import { StyleSheet } from 'react-native';
import { cores, espacamentos, radius, shadows, typography } from '../../../shared/theme';

const estilos = StyleSheet.create({
    container: { width: '100%', height: 94.33, paddingTop: 12, paddingHorizontal: espacamentos.pequeno },
    faixa: { gap: espacamentos.pequeno, paddingHorizontal: espacamentos.pequeno, paddingVertical: espacamentos.minimo },
    dia: {
        width: 46,
        height: 74.33,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 10,
        borderRadius: radius.onboardingCalendar,
        backgroundColor: cores.neutras.superficieClara,
        borderWidth: 0.666667,
        borderColor: cores.neutras.bordaClara
    },
    diaSelecionado: shadows.cardSuave,
    diaSelecionado_menstrual: { backgroundColor: cores.marca.primaria, borderColor: cores.marca.primaria },
    diaSelecionado_folicular: { backgroundColor: cores.marca.secundaria, borderColor: cores.marca.secundaria },
    diaSelecionado_ovulatoria: { backgroundColor: cores.feedback.informacao, borderColor: cores.feedback.informacao },
    diaSelecionado_lutea: { backgroundColor: cores.feedback.aviso, borderColor: cores.feedback.aviso },
    diaSelecionado_desconhecida: { backgroundColor: cores.neutras.textoSecundarioClaro },
    semana: { ...typography.labelCompact, color: cores.neutras.textoSecundarioClaro, textTransform: 'capitalize', opacity: 0.7 },
    textoNumero: { ...typography.numberCompact, color: cores.neutras.textoSecundarioClaro, marginTop: 2 },
    semanaSelecionada: { color: cores.neutras.fundoClaro, opacity: 0.85 },
    numeroSelecionado: { ...typography.numberCompactStrong, color: cores.neutras.fundoClaro },
    textoSelecionadoDesconhecido: { color: cores.neutras.superficieClara },
    indicador: { width: 5, height: 5, marginTop: espacamentos.minimo, borderRadius: 3, backgroundColor: 'transparent' },
    indicadorHoje: { backgroundColor: cores.neutras.textoPrincipalClaro },
    indicadorSelecionado: { backgroundColor: cores.neutras.fundoClaro },
    indicadorSelecionadoDesconhecido: { backgroundColor: cores.neutras.superficieClara }
});

export { estilos };
