//Define a aparência fechada e expandida dos grupos de permissões.
import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';
import { temaClaro } from '../../../../shared/theme/themePalettes';

function criarEstilos(tema, aparenciaNovaCategoria = false) {
    return StyleSheet.create({
        container: {
            width: '100%',
            alignSelf: 'stretch',
            overflow: 'hidden',
            backgroundColor:
                tema.escuro && aparenciaNovaCategoria ? '#1E1E1E' : tema.cores.interface.superficie,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.borda,
            borderRadius: 14
        },

        cabecalho: {
            width: '100%',
            minHeight: 60,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            gap: 10,
            backgroundColor:
                tema.escuro && aparenciaNovaCategoria ? '#1E1E1E' : tema.cores.interface.superficie
        },

        areaExpansao: {
            flex: 1,
            minWidth: 0,
            minHeight: 60,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10
        },

        pressionado: {
            opacity: 0.72
        },

        caixaIcone: {
            width: 34,
            height: 34,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9
        },

        textos: {
            flex: 1,
            minWidth: 0,
            justifyContent: 'center'
        },

        titulo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            fontWeight: '600',
            lineHeight: 21,
            includeFontPadding: false
        },

        contagem: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            fontWeight: '400',
            lineHeight: 18,
            includeFontPadding: false
        },

        lista: {
            width: '100%',
            ...(tema.escuro && aparenciaNovaCategoria ? { backgroundColor: '#1A1A1A' } : {}),
            borderTopWidth: 0.7
        },

        item: {
            width: '100%'
        },

        itemComSeparador: {
            borderTopWidth: 0.7,
            borderTopColor: tema.cores.interface.borda
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
