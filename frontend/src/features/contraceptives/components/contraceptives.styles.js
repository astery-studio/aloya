import { StyleSheet } from 'react-native';
import { espacamentos, radius, typography } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    const interfaceTema = tema.cores.interface;
    return StyleSheet.create({
        card: {
            padding: espacamentos.medio,
            borderRadius: radius.onboardingCalendar,
            borderWidth: 1,
            borderColor: interfaceTema.borda,
            backgroundColor: interfaceTema.superficie,
            gap: espacamentos.pequeno
        },
        cabecalhoCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: espacamentos.pequeno
        },
        titulosCard: { flex: 1 },
        nome: { ...typography.bodyLarge, color: interfaceTema.textoPrincipal },
        textoSecundario: { ...typography.caption, color: interfaceTema.textoSecundario },
        frequencia: { ...typography.bodyDefault, color: interfaceTema.textoPrincipal },
        horarios: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.pequeno },
        horario: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: espacamentos.minimo,
            paddingVertical: espacamentos.minimo,
            paddingHorizontal: espacamentos.pequeno,
            borderRadius: radius.switch,
            backgroundColor: interfaceTema.destaqueSuave
        },
        textoHorario: { ...typography.caption, color: interfaceTema.destaque },
        proximo: {
            ...typography.caption,
            color: tema.escuro ? '#9FD6B6' : tema.cores.feedback.sucesso
        },
        alerta: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: espacamentos.minimo,
            paddingVertical: espacamentos.minimo,
            paddingHorizontal: espacamentos.pequeno,
            borderRadius: radius.switch
        },
        alerta_leve: { backgroundColor: tema.escuro ? '#31463B' : '#EEF4F0' },
        alerta_moderado: { backgroundColor: tema.escuro ? '#4B3924' : '#F5EDE3' },
        alerta_critico: { backgroundColor: tema.escuro ? '#4C302B' : '#FDF0EC' },
        textoAlerta: { ...typography.micro, color: interfaceTema.textoPrincipal }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
