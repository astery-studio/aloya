import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    conteudo: { flexGrow: 1, paddingTop: 8, paddingBottom: 16 },
    identificacao: { paddingTop: 16, paddingBottom: 16 },
    educacao: { paddingTop: 34 },
    rodape: { paddingTop: 34 },
    selo: {
        color: '#2C4C3B',
        backgroundColor: '#EEF4F0',
        borderRadius: 99,
        paddingHorizontal: 7,
        paddingVertical: 2,
        fontFamily: fontFamilies.semibold,
        fontSize: 9,
        lineHeight: 14
    },
    grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 16 },
    itemGrade: {
        flexGrow: 1,
        flexBasis: '45%',
        minHeight: 90,
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: 6
    },
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
