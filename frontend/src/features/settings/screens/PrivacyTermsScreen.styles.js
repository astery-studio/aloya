import { StyleSheet } from 'react-native';

export function criarEstilos(tema) {
    const cor = tema.cores.interface;

    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: cor.fundo }
    });
}
