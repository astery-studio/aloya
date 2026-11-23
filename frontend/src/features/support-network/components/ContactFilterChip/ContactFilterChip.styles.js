//Define a aparência dos chips de estado e permissão.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos() {
    return StyleSheet.create({
        container: {
            minHeight: 36,
            maxWidth: '100%',
            paddingVertical: 7,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            borderRadius: 999
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
            container: Object.freeze({
                backgroundColor: tema.escuro ? 'rgba(242, 180, 95, 0.14)' : '#F7F0E6'
            }),

            texto: Object.freeze({
                color: tema.escuro ? '#F2B45F' : '#B07D2A'
            }),

            corIndicador: tema.escuro ? '#F2B45F' : '#B07D2A'
        }),

        permissao: Object.freeze({
            container: Object.freeze({
                backgroundColor: tema.escuro ? 'rgba(159, 214, 182, 0.14)' : '#EDF0EE'
            }),

            texto: Object.freeze({
                color: tema.escuro ? '#9FD6B6' : '#2C4C3B'
            }),

            corIndicador: tema.escuro ? '#9FD6B6' : '#2C4C3B'
        })
    });
}

export { criarEstilos, criarVariantes };
