import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    conteudo: { flexGrow: 1, gap: 24, paddingTop: 8, paddingBottom: 24 },
    margem: { paddingHorizontal: 16 },
    botaoAnticoncepcionais: { borderRadius: 99 },
    secao: { gap: 10 },
    linhaRotulo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
    selo: {
        color: '#A55F19',
        backgroundColor: '#FBF3E0',
        borderRadius: 99,
        paddingHorizontal: 7,
        paddingVertical: 2,
        fontFamily: fontFamilies.medium,
        fontSize: 9
    },
    rotulo: { color: '#A55F19', fontFamily: fontFamilies.bold, fontSize: 10, letterSpacing: 1 },
    titulo: { color: '#222222', fontFamily: fontFamilies.medium, fontSize: 22, lineHeight: 29 },
    tituloMomento: { color: '#222222', fontFamily: fontFamilies.medium, fontSize: 17 },
    descricao: { color: '#5C5C59', fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 20 },
    grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    gesto: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E6E2D8',
        borderWidth: 0.7,
        borderRadius: 22,
        padding: 16,
        gap: 10
    },
    itemGrade: { flexGrow: 1, flexBasis: '45%', minHeight: 90 },
    tituloGesto: { color: '#222222', fontFamily: fontFamilies.bold, fontSize: 13 },
    caixaIcone: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9EEE8'
    }
});

export { estilos };
