/**
 * Aparência do calendário menstrual exibido dentro do onboarding.
 */
import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius } from '../../../theme';

const estilos = StyleSheet.create({
    calendario: {
        width: '100%', maxWidth: 342, height: 397, alignSelf: 'center',
        backgroundColor: cores.neutras.superficieClara,
        borderColor: cores.neutras.bordaClara, borderWidth: 0.705,
        borderRadius: radius.onboardingCalendar, overflow: 'hidden'
    },
    cabecalho: {
        height: 76, paddingTop: 16, paddingHorizontal: 12, paddingBottom: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomColor: '#F0EBE3', borderBottomWidth: 0.705
    },
    navegacao: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    tituloMes: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 10, paddingVertical: 6
    },
    textoMes: {
        color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold,
        fontSize: 16, fontWeight: '700', lineHeight: 24
    },
    semana: {
        height: 33, paddingTop: 8, paddingHorizontal: 8, flexDirection: 'row'
    },
    textoSemana: {
        flex: 1, paddingVertical: 4, textAlign: 'center',
        color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.semibold,
        fontSize: 11, fontWeight: '600', lineHeight: 16.5, letterSpacing: 0.44
    },
    grade: {
        height: 287, paddingTop: 4, paddingHorizontal: 8, paddingBottom: 7,
        flexDirection: 'row', flexWrap: 'wrap'
    },
    casa: {
        width: '14.285714%', height: 46, alignItems: 'center', justifyContent: 'center'
    },
    dia: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    diaSelecionado: { backgroundColor: cores.marca.primaria },
    textoDia: {
        color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.regular,
        fontSize: 16, lineHeight: 24
    },
    textoSelecionado: { color: cores.neutras.superficieClara, fontFamily: fontFamilies.bold },
    textoDesabilitado: { color: cores.neutras.bordaTracejada }
});

export { estilos };
