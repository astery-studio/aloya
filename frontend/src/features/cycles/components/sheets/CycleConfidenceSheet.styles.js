import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const CORES = Object.freeze({
    baixa: { destaque: '#C85A44', fundo: 'rgba(200, 90, 68, 0.1)' },
    media: { destaque: '#D68C3A', fundo: 'rgba(214, 140, 58, 0.1)' },
    alta: { destaque: '#2C4C3B', fundo: 'rgba(44, 76, 59, 0.1)' }
});

const estilos = StyleSheet.create({
    painel: { paddingTop: 8, paddingBottom: 48 },
    conteudo: { paddingHorizontal: 24 },
    cabecalho: { height: 54, flexDirection: 'row', alignItems: 'center', gap: 5 },
    icone: {
        width: 54,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18
    },
    nivel: {
        flex: 1,
        color: '#847F76',
        fontFamily: fontFamilies.bold,
        fontSize: 10,
        lineHeight: 16,
        letterSpacing: 0.8,
        textTransform: 'uppercase'
    },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 26,
        lineHeight: 39,
        letterSpacing: -0.91,
        paddingVertical: 10
    },
    descricao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        lineHeight: 21
    },
    escala: {
        height: 43,
        flexDirection: 'row',
        marginTop: 18,
        padding: 5,
        borderRadius: 14,
        backgroundColor: '#F7F5F0'
    },
    opcao: {
        flex: 1,
        height: 33,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },
    textoOpcao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 10,
        lineHeight: 15
    },
    textoSelecionado: { color: '#FFFFFF', fontFamily: fontFamilies.bold }
});

export { CORES, estilos };
