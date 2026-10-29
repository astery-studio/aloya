/**
 * Define trilha e preenchimento visual do progresso do cadastro.
 */
import { StyleSheet } from 'react-native';
import { radius } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        area: {
            paddingHorizontal: 24,
            paddingTop: 20,
            width: '100%'
        },
        trilha: {
            backgroundColor: tema.cores.interface.borda,
            borderRadius: radius.switch,
            height: 3,
            overflow: 'hidden',
            width: '100%'
        },
        progresso: {
            backgroundColor: tema.cores.interface.destaque,
            borderRadius: radius.switch,
            height: 3
        }
    });
}

export { criarEstilos };
