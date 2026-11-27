/**
 * Aparência responsiva da escolha do tipo de usuário.
 */
import { StyleSheet } from 'react-native';

import { espacamentos, typography } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        cabecalho: {
            minHeight: 48,
            paddingHorizontal: espacamentos.grande
        },
        botaoVoltar: {
            alignItems: 'center',
            height: 48,
            justifyContent: 'center',
            width: 48
        },
        conteudo: {
            alignItems: 'center',
            gap: 28,
            maxWidth: 342,
            width: '100%'
        },
        textos: {
            alignItems: 'center',
            gap: 12,
            maxWidth: 304
        },
        titulo: {
            ...typography.h1,
            color: tema.escuro ? '#E3E3E3' : tema.cores.interface.textoPrincipal,
            textAlign: 'center'
        },
        descricao: {
            ...typography.bodyDefault,
            color: tema.escuro ? '#999999' : tema.cores.interface.textoSecundario,
            textAlign: 'center'
        },
        acoes: {
            gap: 20,
            width: '100%'
        }
    });
}

export { criarEstilos };
