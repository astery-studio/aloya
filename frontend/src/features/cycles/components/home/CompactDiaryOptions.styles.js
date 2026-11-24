import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    lista: {
        gap: 12
    },
    grupo: {
        width: 294,
        maxWidth: '100%',
        alignSelf: 'center',
        gap: 6
    },
    cabecalho: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center'
    },
    divisor: {
        backgroundColor: '#E6E2D8',
        flex: 1,
        height: 0.666667
    },
    titulo: {
        color: '#5C5C59',
        fontFamily: fontFamilies.semibold,
        fontSize: 10,
        fontWeight: '600',
        lineHeight: 15,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    opcoes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center'
    }
});

export { estilos };
