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
