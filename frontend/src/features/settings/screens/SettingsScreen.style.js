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
            backgroundColor: tema.escuro ? '#121212' : tema.cores.interface.fundo
        },

        secao: {
            width: '100%',
            gap: 10
        },

        tituloSecao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: 19.6,
            includeFontPadding: false
        },

        campo: tema.escuro
            ? {
                  backgroundColor: '#1E1E1E'
              }
            : {},

        campoComBorda: tema.escuro
            ? {
                  backgroundColor: '#1E1E1E',
                  borderRadius: 12,
                  borderWidth: 0.705,
                  borderColor: '#2C2C2C'
              }
            : {},

        grupo: {
            width: '100%',
            overflow: 'hidden',
            backgroundColor: tema.escuro ? '#1E1E1E' : tema.cores.interface.superficie,
            borderWidth: 0.7,
            borderColor: tema.escuro ? '#2C2C2C' : tema.cores.interface.borda,
            borderRadius: tema.radius.buttonAndInput
        },

        separador: {
            width: 288.586,
            height: 0.991,
            alignSelf: 'center',
            backgroundColor: tema.cores.interface.borda
        }
    });
}

export { criarEstilos };
