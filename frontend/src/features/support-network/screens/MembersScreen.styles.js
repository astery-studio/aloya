import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        conteudo: {
            flexGrow: 1,
            gap: tema.espacamentos.extraGrande,
            paddingHorizontal: tema.espacamentos.grande,
            paddingTop: tema.espacamentos.grande,
            paddingBottom: tema.espacamentos.extraGrande
        },

        apresentacao: {
            width: '100%',
            gap: tema.espacamentos.pequeno
        },

        titulo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 22,
            lineHeight: 29,
            includeFontPadding: false
        },

        descricao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            lineHeight: 24,
            includeFontPadding: false
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
