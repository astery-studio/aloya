/**
 * Define os estilos da mensagem final e do logotipo.
 */
import { StyleSheet } from 'react-native';
import { fontFamilies, typography } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        conteudo: { alignItems: 'center', gap: 20, width: '100%' },
        titulo: {
            ...typography.h1,
            color: tema.escuro ? '#E3E3E3' : tema.cores.interface.textoPrincipal,
            maxWidth: 342,
            textAlign: 'center'
        },
        marca: {
            color: tema.cores.marca.primaria,
            fontFamily: fontFamilies.bold,
            fontWeight: '900'
        },
        logo: {
            width: '100%',
            maxWidth: 320,
            aspectRatio: 1
        }
    });
}

export { criarEstilos };
