import { StyleSheet } from 'react-native';

import { fontFamilies, tema } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    formulario: {
        gap: 16,
        paddingTop: 12,
        paddingBottom: 40
    },
    campo: {
        gap: 8
    },
    label: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        lineHeight: 21
    },
    ajuda: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center'
    },
    limpar: {
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textoLimpar: {
        color: tema.cores.marca.primaria,
        fontFamily: fontFamilies.medium,
        fontSize: 13,
        lineHeight: 18
    }
});

export { estilos };
