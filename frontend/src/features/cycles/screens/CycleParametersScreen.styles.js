import { StyleSheet } from 'react-native';

import { fontFamilies, tema } from '../../../shared/theme';

const estilos = StyleSheet.create({
    estado: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: tema.espacamentos.medio
    },
    tituloErro: {
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 20,
        lineHeight: 30
    },
    textoEstado: {
        color: tema.cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center'
    }
});

export { estilos };
