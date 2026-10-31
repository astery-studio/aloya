import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            gap: tema.espacamentos.grande
        },

        secao: {
            width: '100%',
            gap: tema.espacamentos.pequeno
        },

        tituloSecao: {
            marginLeft: 4,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: 21
        },

        campoAlterarSenha: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 0.705,
                  borderColor: '#2C2C2C',
                  backgroundColor: '#1E1E1E'
              }
            : {},
        campos: {
            width: '100%',
            gap: tema.espacamentos.pequeno
        }
    });
}

export { criarEstilos };
