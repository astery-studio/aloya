//Define os estados visuais dos filtros compactos de contatos.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            minHeight: 36,
            maxWidth: '100%',
            paddingVertical: 7,
            paddingHorizontal: 14,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderRadius: 999
        },

        containerNaoSelecionado: {
            borderColor: tema.cores.interface.borda,
            backgroundColor: tema.cores.interface.superficie
        },

        texto: {
            flexShrink: 1,
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: 19.5,
            includeFontPadding: false,
            textAlign: 'center'
        },

        textoNaoSelecionado: {
            color: tema.cores.interface.textoSecundario
        },

        pressionado: {
            opacity: 0.72,
            transform: [{ scale: 0.97 }]
        },

        desabilitado: {
            opacity: 0.46
        }
    });
}

function criarVariantes(tema) {
    return Object.freeze({
        estado: Object.freeze({
            containerSelecionado: Object.freeze({
                borderColor: tema.cores.interface.destaque,
                backgroundColor: tema.cores.interface.destaque
            }),

            textoSelecionado: Object.freeze({
                color: tema.cores.interface.textoSobreDestaque
            })
        }),

        permissao: Object.freeze({
            containerSelecionado: Object.freeze({
                borderColor: tema.escuro ? '#F08A75' : '#C85A44',
                backgroundColor: tema.escuro ? '#F08A75' : '#C85A44'
            }),

            textoSelecionado: Object.freeze({
                color: tema.escuro ? '#181C1A' : '#FFFFFF'
            })
        })
    });
}

export { criarEstilos, criarVariantes };
