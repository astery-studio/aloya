import { StyleSheet } from 'react-native';

function criarEstilos(tema) {
    return StyleSheet.create({
        areaIcone: {
            width: 48,
            height: 48,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center'
        },
        fundoConfirmacao: {
            backgroundColor: tema.escuro ? '#333333' : '#F5EDE3'
        },
        fundoSucesso: { backgroundColor: tema.escuro ? '#444444' : '#F5EDE3' },
        fundoErro: {
            backgroundColor: tema.escuro ? 'transparent' : '#EDEDED'
        }
    });
}

export { criarEstilos };
