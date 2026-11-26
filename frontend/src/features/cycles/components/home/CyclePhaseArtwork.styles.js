import { StyleSheet } from 'react-native';

const TAMANHO_ARTE = 260;
const RAIO_INTERNO_MOLDURA = 113;
const TAMANHO_MASCARA = RAIO_INTERNO_MOLDURA * 2;
const RECUO_MASCARA = (TAMANHO_ARTE - TAMANHO_MASCARA) / 2;

const estilos = StyleSheet.create({
    container: {
        width: TAMANHO_ARTE,
        height: TAMANHO_ARTE,
        alignItems: 'center',
        justifyContent: 'center'
    },
    mascara: {
        position: 'absolute',
        top: RECUO_MASCARA,
        left: RECUO_MASCARA,
        width: TAMANHO_MASCARA,
        height: TAMANHO_MASCARA,
        borderRadius: RAIO_INTERNO_MOLDURA,
        overflow: 'hidden'
    },
    imagem: {
        position: 'absolute',
        top: -RECUO_MASCARA,
        left: -RECUO_MASCARA,
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

export { estilos, RAIO_INTERNO_MOLDURA, TAMANHO_ARTE, TAMANHO_MASCARA };
