import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 24,
        width: '100%'
    },
    simbolo: {
        height: 260,
        width: 260
    },
    titulo: {
        color: '#222222',
        fontFamily: fontFamilies.regular,
        fontSize: 31,
        fontWeight: '400',
        letterSpacing: -1.085,
        lineHeight: 33,
        marginTop: 16,
        maxWidth: 310,
        textAlign: 'center'
    },
    descricao: {
        color: '#5C5C59',
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 21,
        marginTop: 13,
        maxWidth: 330,
        textAlign: 'center'
    }
});

export { estilos };
