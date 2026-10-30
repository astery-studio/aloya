// Define o visual do menu principal de configurações conforme o protótipo.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        conteudo: {
            flexGrow: 1,
            gap: tema.espacamentos.extraGrande,
            paddingHorizontal: tema.espacamentos.grande,
            paddingBottom: tema.espacamentos.extraGrande,
            backgroundColor: tema.cores.interface.fundo
        },

        secao: {
            width: '100%',
            gap: 10
        },

        tituloSecao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 16,
            lineHeight: 24,
            includeFontPadding: false
        },

        grupo: {
            width: '100%',
            overflow: 'hidden',
            backgroundColor: tema.cores.interface.superficie,
            borderWidth: 0.7,
            borderColor: tema.cores.interface.borda,
            borderRadius: tema.radius.buttonAndInput
        },

        separador: {
            height: 0.7,
            marginLeft: 61,
            backgroundColor: tema.cores.interface.borda
        }
    });
}

export { criarEstilos };
