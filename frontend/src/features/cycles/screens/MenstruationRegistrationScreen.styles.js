import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: '#F7F5F0' },
    cabecalho: {
        minHeight: 67,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        justifyContent: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#EDEAE4'
    },
    titulo: {
        textAlign: 'center',
        marginLeft: 24,
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        lineHeight: 39,
        color: '#222222'
    },
    voltar: {
        position: 'absolute',
        left: 10,
        top: 13,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center'
    },
    legenda: {
        minHeight: 40,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#EDEAE4',
        flexWrap: 'wrap'
    },
    itemLegenda: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    textoLegenda: {
        fontFamily: fontFamilies.regular,
        fontSize: 11,
        lineHeight: 16,
        color: '#5C5C59'
    },
    simboloAnterior: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(200,90,68,0.1)',
        borderWidth: 0.7,
        borderColor: '#C85A44'
    },
    simboloSelecionado: { width: 18, height: 10, borderRadius: 5, backgroundColor: '#C85A44' },
    diasSemana: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        height: 28,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#EDEAE4'
    },
    nomeSemana: {
        flex: 1,
        textAlign: 'center',
        fontFamily: fontFamilies.semibold,
        fontSize: 11,
        lineHeight: 16,
        letterSpacing: 0.44,
        color: '#5C5C59'
    },
    mes: {
        paddingHorizontal: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#EDEAE4'
    },
    tituloMes: {
        height: 42,
        marginHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    nomeMes: { fontFamily: fontFamilies.bold, fontSize: 15, color: '#222222' },
    ano: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 18, color: '#5C5C59' },
    semana: { flexDirection: 'row', height: 52 },
    celula: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    dia: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    numero: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 21, color: '#222222' },
    futuro: { color: '#CFCFC8' },
    numeroMarcado: { color: '#AC422E', fontFamily: fontFamilies.semibold },
    numeroPonta: { color: '#FFFFFF' },
    registrado: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(200,90,68,0.1)',
        borderColor: '#C85A44',
        borderWidth: 0.7
    },
    ponta: { backgroundColor: '#C85A44', width: 42, height: 42, borderRadius: 21 },
    faixa: { position: 'absolute', height: 42, left: 0, right: 0, backgroundColor: '#F6D8D1' },
    inicioFaixa: { left: 5, borderTopLeftRadius: 21, borderBottomLeftRadius: 21 },
    fimFaixa: { right: 5, borderTopRightRadius: 21, borderBottomRightRadius: 21 },
    ajuda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 0.7,
        borderColor: '#2D5141',
        borderRadius: 12,
        backgroundColor: '#EFEFE8'
    },
    textoAjuda: {
        flex: 1,
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        lineHeight: 20,
        color: '#2D5141'
    },
    rodape: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#EDEAE4'
    },
    salvar: { minHeight: 56, borderRadius: 12 },
    iconeFeedback: { borderRadius: 14 },
    vazio: { padding: 24, fontFamily: fontFamilies.regular, color: '#5C5C59' }
});
export { estilos };
