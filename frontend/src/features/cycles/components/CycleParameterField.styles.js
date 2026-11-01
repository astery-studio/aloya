import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        grupo: {
            gap: tema.espacamentos.pequeno
        },
        erro: {
            paddingHorizontal: tema.espacamentos.medio,
            color: tema.escuro ? '#EF9A9A' : tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18
        }
    });
}

export { criarEstilos };
