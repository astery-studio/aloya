/**
 * Aparência do calendário menstrual exibido dentro do onboarding.
 */
import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius } from '../../../theme';

const estilos = StyleSheet.create({
    calendario: {
        width: '100%', maxWidth: 330, height: 340, alignSelf: 'center',
        backgroundColor: cores.neutras.superficieClara,
        borderColor: cores.neutras.bordaClara, borderWidth: 0.705,
        borderRadius: radius.onboardingCalendar, overflow: 'hidden'
    },
    cabecalho: {
        height: 60, paddingHorizontal: 10,
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
        fontSize: 18, fontWeight: '700', lineHeight: 27
    },
    semana: {
        height: 32, paddingTop: 6, paddingHorizontal: 6, flexDirection: 'row'
    },
    textoSemana: {
        flex: 1, paddingVertical: 4, textAlign: 'center',
        color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.medium,
        fontSize: 14, fontWeight: '500', lineHeight: 20
    },
    grade: {
        height: 247, paddingTop: 4, paddingHorizontal: 6, paddingBottom: 3,
        flexDirection: 'row', flexWrap: 'wrap'
    },
    casa: {
        width: '14.285714%', height: 40, alignItems: 'center', justifyContent: 'center'
    },
    dia: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    diaSelecionado: { backgroundColor: cores.marca.primaria },
    textoDia: {
        color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.regular,
        fontSize: 16, lineHeight: 24
    },
    textoSelecionado: { color: cores.neutras.superficieClara, fontFamily: fontFamilies.bold },
    textoDesabilitado: { color: cores.neutras.bordaTracejada },
    setaAberta: { transform: [{ rotate: '180deg' }] },
    listaMeses: { height: 279, flexGrow: 0 },
    opcaoMes: { height: 44, alignItems: 'center', justifyContent: 'center' },
    textoOpcao: {
        color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.regular,
        fontSize: 16, lineHeight: 24
    },
    textoOpcaoSelecionada: { color: cores.marca.primaria, fontFamily: fontFamilies.bold }
});

export { estilos };
