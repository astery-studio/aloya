import { StyleSheet } from 'react-native';

const TAMANHO_ARTE = 260;

const estilos = StyleSheet.create({
    container: {
        width: TAMANHO_ARTE,
        height: TAMANHO_ARTE,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imagem: {
        width: TAMANHO_ARTE,
        height: TAMANHO_ARTE
    },
    moldura: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: TAMANHO_ARTE,
        height: TAMANHO_ARTE
    }
});

export { estilos, TAMANHO_ARTE };
