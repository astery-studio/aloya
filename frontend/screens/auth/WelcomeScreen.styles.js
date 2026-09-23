import { StyleSheet } from 'react-native';
import { cores, espacamentos, fontFamilies } from '../../theme';

const estilos = StyleSheet.create({
    tela: {
        backgroundColor: cores.neutras.fundoClaro,
        flex: 1
    },
    logo: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    reservaLogo: {
        color: cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 26,
        letterSpacing: 1.04,
        lineHeight: 39
    },
    acoes: {
        gap: 12,
        paddingBottom: 56,
        paddingHorizontal: espacamentos.grande
    }
});

export { estilos };
/**
 * Define a composição visual da tela inicial de autenticação.
 */
