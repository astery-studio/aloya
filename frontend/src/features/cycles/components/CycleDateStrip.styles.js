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
            justifyContent: 'flex-start',
            paddingVertical: 10,
            borderRadius: radius.onboardingCalendar,
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 0.666667,
            borderColor: tema.cores.interface.borda
        },
        diaSelecionado: shadows.cardSuave,
        diaSelecionado_menstrual: {
            backgroundColor: tema.escuro ? '#A84432' : tema.cores.marca.primaria,
            borderColor: tema.escuro ? '#A84432' : tema.cores.marca.primaria
        },
        diaSelecionado_folicular: {
            backgroundColor: tema.escuro ? '#2C4C3B' : tema.cores.marca.secundaria,
            borderColor: tema.escuro ? '#2C4C3B' : tema.cores.marca.secundaria
        },
        diaSelecionado_ovulatoria: {
            backgroundColor: tema.escuro ? '#3E6578' : tema.cores.feedback.informacao,
            borderColor: tema.escuro ? '#3E6578' : tema.cores.feedback.informacao
        },
        diaSelecionado_lutea: {
            backgroundColor: tema.escuro ? '#8A5A12' : tema.cores.feedback.aviso,
            borderColor: tema.escuro ? '#8A5A12' : tema.cores.feedback.aviso
        },
        diaSelecionado_desconhecida: { backgroundColor: tema.cores.interface.textoSecundario },
        semana: {
            ...typography.labelCompact,
            color: tema.cores.interface.textoSecundario,
            textTransform: 'capitalize',
            opacity: 0.7
        },
        textoNumero: {
            ...typography.numberCompact,
            color: tema.cores.interface.textoSecundario,
            marginTop: 2
        },
        semanaSelecionada: { color: corSelecionada, opacity: 0.85 },
        numeroSelecionado: { ...typography.numberCompactStrong, color: corSelecionada },
        textoSelecionadoDesconhecido: { color: tema.cores.interface.superficie },
        indicador: {
            width: 5,
            height: 5,
            marginTop: espacamentos.minimo,
            borderRadius: 3,
            backgroundColor: 'transparent'
        },
        indicadorHoje: { backgroundColor: tema.cores.interface.textoPrincipal },
        indicadorSelecionado: { backgroundColor: corSelecionada },
        indicadorSelecionadoDesconhecido: { backgroundColor: tema.cores.interface.superficie }
    });
}

export { criarEstilos };
