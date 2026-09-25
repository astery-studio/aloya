import { StyleSheet } from 'react-native';
import { cores, espacamentos, radius, typography } from '../../../theme';

const estilos = StyleSheet.create({
    card: { padding: espacamentos.medio, borderRadius: radius.onboardingCalendar, borderWidth: 1, borderColor: cores.neutras.bordaClara, backgroundColor: cores.neutras.superficieClara, gap: espacamentos.pequeno },
    cabecalhoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.pequeno },
    titulosCard: { flex: 1 },
    nome: { ...typography.bodyLarge, color: cores.neutras.textoPrincipalClaro },
    textoSecundario: { ...typography.caption, color: cores.neutras.textoSecundarioClaro },
    frequencia: { ...typography.bodyDefault, color: cores.neutras.textoPrincipalClaro },
    horarios: { flexDirection: 'row', flexWrap: 'wrap', gap: espacamentos.pequeno },
    horario: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.minimo, paddingVertical: espacamentos.minimo, paddingHorizontal: espacamentos.pequeno, borderRadius: radius.switch, backgroundColor: cores.icones.anticoncepcionais.verde.caixa },
    textoHorario: { ...typography.caption, color: cores.marca.secundaria },
    proximo: { ...typography.caption, color: cores.feedback.sucesso },
    alerta: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.minimo, paddingVertical: espacamentos.minimo, paddingHorizontal: espacamentos.pequeno, borderRadius: radius.switch },
    alerta_leve: { backgroundColor: '#EEF4F0' },
    alerta_moderado: { backgroundColor: '#F5EDE3' },
    alerta_critico: { backgroundColor: '#FDF0EC' },
    textoAlerta: { ...typography.micro, color: cores.neutras.textoPrincipalClaro }
});

export { estilos };
