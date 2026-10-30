/**
 * Define a composição visual da tela inicial de autenticação.
 */
import { StyleSheet } from 'react-native';
import { espacamentos, fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        tela: {
            backgroundColor: tema.cores.interface.fundo,
            flex: 1
        },
        logo: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center'
        },
        reservaLogo: {
            color: tema.cores.interface.textoPrincipal,
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
}

export { criarEstilos };
