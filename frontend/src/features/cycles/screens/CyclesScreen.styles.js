//Organiza a vitrine provisória dos componentes de histórico sem alterar seus estilos internos.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        conteudo: {
            paddingHorizontal: tema.espacamentos.grande,
            paddingBottom: tema.espacamentos.extraGrande
        },

        cabecalhoDaLista: {
            width: '100%',
            gap: tema.espacamentos.grande,
            paddingBottom: tema.espacamentos.medio
        },

        apresentacao: {
            width: '100%',
            gap: tema.espacamentos.pequeno
        },

        titulo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 22,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 29,
            includeFontPadding: false
        },

        descricao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 16,
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 24,
            includeFontPadding: false
        },

        tituloDaSecao: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 27,
            includeFontPadding: false
        },

        item: {
            width: '100%',
            marginBottom: 12
        }
    });
}

export { criarEstilos };
