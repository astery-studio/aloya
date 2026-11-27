import { StyleSheet } from 'react-native';
import { espacamentos, radius, shadows, typography } from '../../../shared/theme';
import { coresNoturnasConteudo } from '../../../shared/theme/coresNoturnasConteudo';

function criarEstilos(tema) {
    const corSelecionada = tema.escuro ? '#FFFFFF' : '#F7F5F0';
    const { coral, verde, azul, superficie, borda, fundo } = coresNoturnasConteudo;
    const menstrual = tema.escuro ? coral : '#C85A44';
    const folicular = tema.escuro ? verde : '#2C4C3B';
    const ovulatoria = tema.escuro ? azul : '#4A758E';

    return StyleSheet.create({
        container: {
            width: '100%',
            height: 82.33
        },
        containerSemCiclo: { height: 94.33, paddingTop: 12, paddingHorizontal: 8 },
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
        dia_menstrual: { backgroundColor: menstrual, borderColor: menstrual },
        dia_folicular: { backgroundColor: folicular, borderColor: folicular },
        dia_ovulatoria: { backgroundColor: ovulatoria, borderColor: ovulatoria },
        dia_lutea: { backgroundColor: '#D68C3A', borderColor: '#D68C3A' },
        dia_desconhecida: {
            backgroundColor: tema.escuro ? superficie : '#FFFFFF',
            borderColor: tema.escuro ? borda : '#E6E2D8'
        },
        diaSemCiclo: { paddingTop: 10 },
        diaSelecionado: { ...shadows.cardSuave, paddingTop: 10 },
        diaSelecionadoDesconhecida: {
            backgroundColor: tema.escuro ? '#424242' : '#5C5C59',
            borderColor: tema.escuro ? borda : '#E6E2D8'
        },
        interior: {
            width: 42,
            height: 62,
            alignItems: 'center',
            justifyContent: 'center'
        },
        fundoInterior: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 62,
            borderRadius: 14,
            backgroundColor: tema.escuro ? superficie : '#FFFFFF'
        },
        fundoInteriorOculto: { opacity: 0 },
        interiorSelecionado: {
            height: 54,
            justifyContent: 'flex-start'
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
        textoSelecionadoComFase: tema.escuro ? { color: fundo } : {},
        indicador: {
            width: 5,
            height: 5,
            marginTop: espacamentos.minimo,
            borderRadius: 3,
            backgroundColor: 'transparent'
        },
        indicadorHoje: { backgroundColor: tema.cores.interface.textoPrincipal },
        indicadorSelecionado: { backgroundColor: 'transparent' },
        indicadorHojeSelecionado: { backgroundColor: corSelecionada },
        indicadorHojeSelecionadoComFase: tema.escuro ? { backgroundColor: fundo } : {}
    });
}

export { criarEstilos };
