/**
 * Define os estilos da mensagem final e da área reservada ao logotipo.
 */
import { StyleSheet } from 'react-native';
import { fontFamilies, typography } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        conteudo: { alignItems: 'center', gap: 40, width: '100%' },
        titulo: {
            ...typography.h1,
            color: tema.cores.interface.textoPrincipal,
            maxWidth: 342,
            textAlign: 'center'
        },
        marca: {
            color: tema.cores.marca.primaria,
            fontFamily: fontFamilies.bold,
            fontWeight: '900'
        },
        logo: {
            alignItems: 'center',
            height: 80,
            justifyContent: 'center',
            width: 220
        }
    });
}

export { criarEstilos };
