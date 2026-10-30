/**
 * Centraliza os estilos e variantes dos campos textuais reutilizáveis.
 */
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            height: 60,
            borderRadius: tema.radius.buttonAndInput,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.borda,
            backgroundColor: tema.cores.interface.superficie,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16
        },
        preenchido: {
            borderColor: tema.escuro ? tema.cores.interface.destaque : '#C8B8AD'
        },
        conteudo: { flex: 1, justifyContent: 'center' },
        rotuloFlutuante: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.semibold,
            fontSize: 11,
            fontWeight: '600',
            lineHeight: 16.5,
            letterSpacing: 0.55,
            textTransform: 'uppercase'
        },
        entrada: {
            ...tema.typography.bodyDefault,
            color: tema.cores.interface.textoPrincipal,
            padding: 0,
            minHeight: 24
        },
        categoria: { height: 56, borderWidth: 0.705 },
        popup: {
            height: 52,
            backgroundColor: tema.escuro ? tema.cores.interface.superficieElevada : '#FAFAF8'
        },
        desativado: { opacity: 0.55 },
        containerErro: { borderColor: tema.cores.feedback.erro },
        erro: {
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18
        },
        acao: { padding: 8, marginRight: -8 },
        rotuloExterno: {
            ...tema.typography.caption,
            color: tema.cores.interface.textoSecundario
        },
        grupo: { gap: 8 },
        grupoCampo: { width: '100%', gap: 6 }
    });
}

export { criarEstilos };
