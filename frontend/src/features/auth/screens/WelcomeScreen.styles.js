/**
 * Define a composição visual da tela inicial de autenticação.
 */
import { StyleSheet } from 'react-native';
import { espacamentos } from '../../../shared/theme';

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
        imagemLogo: {
            width: '100%',
            maxWidth: 320,
            aspectRatio: 1
        },
        acoes: {
            gap: 12,
            paddingBottom: 56,
            paddingHorizontal: espacamentos.grande
        }
    });
}

export { criarEstilos };
