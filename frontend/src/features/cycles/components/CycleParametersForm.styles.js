import { StyleSheet } from 'react-native';

import { fontFamilies, tema } from '../../../shared/theme';

const estilos = StyleSheet.create({
    container: {
        width: '100%',
        gap: tema.espacamentos.grande,
        paddingTop: tema.espacamentos.grande
    },
    titulo: {
        paddingLeft: 4,
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        lineHeight: 21
    },
    campos: {
        gap: tema.espacamentos.pequeno
    }
});

export { estilos };
