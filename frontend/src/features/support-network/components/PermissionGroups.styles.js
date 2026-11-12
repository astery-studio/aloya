//Define a organização da seção que reúne todos os grupos de permissões.
import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            alignSelf: 'stretch'
        },

        cabecalho: {
            width: '100%',
            minHeight: 42,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            paddingBottom: 16
        },

        titulo: {
            flex: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 20,
            fontWeight: '700',
            lineHeight: 26,
            includeFontPadding: false
        },

        lista: {
            width: '100%',
            gap: 10
        },

        estadoCatalogo: {
            minHeight: 72,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 12
        },

        textoEstado: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 20,
            textAlign: 'center'
        },

        tentarNovamente: {
            minHeight: 40,
            justifyContent: 'center',
            paddingHorizontal: 12
        },

        textoTentarNovamente: {
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.bold,
            fontSize: 14,
            lineHeight: 20
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
