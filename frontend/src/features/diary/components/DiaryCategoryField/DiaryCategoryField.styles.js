import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';
import { obterCoresDiario } from '../../config/diaryColors';

function criarEstilos(tema) {
    const cores = obterCoresDiario(tema).interface;
    return StyleSheet.create({
        container: { width: '100%', gap: 8 },
        divisorCategoria: {
            width: '100%',
            height: 0.7,
            backgroundColor: cores.borda
        },
        faixaTitulo: {
            width: '100%',
            height: 36,
            minHeight: 36,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 14,
            borderRadius: 10
        },
        titulo: {
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            lineHeight: 20,
            textAlign: 'center'
        },
        grupo: { width: '100%', gap: 8 },
        tituloGrupoLinha: {
            width: '100%',
            maxWidth: 280,
            height: 39,
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
        },
        linha: { flex: 1, height: 1, backgroundColor: cores.borda },
        tituloGrupo: {
            color: cores.textoSecundario,
            fontFamily: fontFamilies.semibold,
            fontSize: 11,
            lineHeight: 16,
            letterSpacing: 0.5
        },
        opcoes: {
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16
        },
        linhaOpcoes: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5
        },
        entradaValor: {
            height: 24,
            padding: 0,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 24,
            textAlign: 'center',
            textAlignVertical: 'center',
            includeFontPadding: false
        },
        placeholderValor: {
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 24,
            textAlign: 'center',
            includeFontPadding: false
        },
        unidadeValor: {
            fontFamily: fontFamilies.bold,
            fontSize: 13,
            fontWeight: '700',
            lineHeight: 24,
            includeFontPadding: false
        },
        campoAnotacao: {
            paddingHorizontal: 20,
            borderWidth: 1,
            borderRadius: 12
        },
        entradaAnotacao: {
            minHeight: 24,
            paddingVertical: 0,
            paddingHorizontal: 32,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 24,
            textAlign: 'center',
            textAlignVertical: 'top'
        },
        limparAnotacao: {
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            borderRadius: 9
        },
        placeholderAnotacao: {
            position: 'absolute',
            right: 83,
            top: 5.995,
            color: '#4A5899',
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 24,
            textAlign: 'center',
            includeFontPadding: false
        },
        medidorAnotacao: {
            position: 'absolute',
            width: '100%',
            paddingHorizontal: 52,
            opacity: 0,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            fontWeight: '400',
            lineHeight: 24,
            textAlign: 'center',
            includeFontPadding: false
        },
        contador: {
            alignSelf: 'flex-end',
            color: cores.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 10,
            lineHeight: 19
        },
        erro: {
            color: tema.cores.feedback.erro,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18
        }
    });
}

export { criarEstilos };
