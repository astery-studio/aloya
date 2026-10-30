import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    carregando: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    mes: {
        width: 312,
        paddingHorizontal: 0
    },
    tituloMes: {
        height: 22,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4
    },
    nomeMes: {
        color: '#222222',
        fontFamily: fontFamilies.bold,
        fontSize: 15,
        lineHeight: 22
    },
    anoMes: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 18
    },
    grade: {
        marginTop: 14,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    diaDaSemana: {
        width: '14.2857%',
        height: 20,
        color: '#A09D96',
        fontFamily: fontFamilies.bold,
        fontSize: 9,
        lineHeight: 14,
        letterSpacing: 0.27,
        textAlign: 'center'
    },
    celula: {
        width: '14.2857%',
        height: 42,
        alignItems: 'center',
        justifyContent: 'center'
    },
    numeroDia: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center'
    },
    diaMarcado: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C85A44'
    },
    numeroMarcado: {
        color: '#FFFFFF',
        fontFamily: fontFamilies.bold,
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center'
    }
});

export { estilos };
