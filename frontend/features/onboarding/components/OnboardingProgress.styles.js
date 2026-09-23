/**
 * Define trilha e preenchimento visual do progresso do cadastro.
 */
import { StyleSheet } from 'react-native';
import { cores, radius } from '../../../theme';

const estilos = StyleSheet.create({
    area: {
        paddingHorizontal: 24,
        paddingTop: 20,
        width: '100%'
    },
    trilha: {
        backgroundColor: cores.neutras.bordaClara,
        borderRadius: radius.switch,
        height: 3,
        overflow: 'hidden',
        width: '100%'
    },
    progresso: {
        backgroundColor: cores.marca.primaria,
        borderRadius: radius.switch,
        height: 3
    }
});

export { estilos };
