import { StyleSheet } from 'react-native';
import { cores, radius, typography } from '../../../theme';

const estilos = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRadius: radius.buttonAndInput
    },

    texto: {
        textAlign: 'center'
    },

    pressionado: {
        opacity: 0.8
    },

    desativado: {
        backgroundColor: cores.neutras.bordaClara,
        borderColor: cores.neutras.bordaClara,
        borderStyle: 'solid'
    }
});

const tamanhos = {
    compacto: {
        container: { height: 52 },
        texto: typography.bodyDefault
    },

    grande: {
        container: { height: 56 },
        texto: {
            ...typography.bodyLarge,
            letterSpacing: 0.18
        }
    }
};

export { estilos, tamanhos };