import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            minWidth: 85,
            height: 26,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: tema.cores.interface.destaqueSuave,
            borderRadius: 999
        },

        texto: {
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.semibold,
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 18,
            includeFontPadding: false
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
