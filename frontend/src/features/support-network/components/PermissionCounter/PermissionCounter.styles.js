import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import { temaClaro } from '../../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            minWidth: 85,
            height: 26,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: tema.escuro
                ? 'rgba(165, 214, 167, 0.10)'
                : tema.cores.interface.destaqueSuave,
            borderRadius: 999
        },

        texto: {
            color: tema.escuro ? coresNoturnasConteudo.verde : tema.cores.interface.destaque,
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
