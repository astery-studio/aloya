//Define as dimensões das variantes do avatar de contato.
import { StyleSheet } from 'react-native';

const estilos = StyleSheet.create({
    base: {
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1
    },

    pequeno: {
        width: 36,
        height: 36,
        borderRadius: 10
    },

    medio: {
        width: 48,
        height: 48,
        borderRadius: 14
    }
});

export { estilos };
