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
            backgroundColor: tema.escuro ? '#4A3737' : '#F5EDE3'
        },
        fundoErro: {
            backgroundColor: tema.escuro ? '#343434' : '#EDEDED'
        }
    });
}

export { criarEstilos };
