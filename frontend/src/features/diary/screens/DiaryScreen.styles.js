import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        conteudo: {
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 28,
            backgroundColor: tema.cores.interface.fundo
        },
        apresentacao: {
            padding: 20,
            gap: 8,
            borderRadius: 18,
            backgroundColor: tema.cores.interface.superficieElevada,
            ...tema.shadows.card
        },
        titulo: {
            fontFamily: fontFamilies.bold,
            fontSize: 22,
            lineHeight: 30,
            color: tema.cores.interface.textoPrincipal
        },
        descricao: {
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21,
            color: tema.cores.interface.textoSecundario
        },
        acao: { marginTop: 20 },
        confirmacao: {
            marginTop: 14,
            fontFamily: fontFamilies.medium,
            fontSize: 13,
            lineHeight: 19,
            textAlign: 'center',
            color: tema.cores.interface.destaque
        }
    });
}

export { criarEstilos };
