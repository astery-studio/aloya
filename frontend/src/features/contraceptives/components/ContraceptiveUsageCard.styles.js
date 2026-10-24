import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

const estilosCartao = StyleSheet.create({
    card: { width: '100%', maxWidth: 350.01, alignSelf: 'center', overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1.40978, borderColor: '#E6E2D8', borderRadius: 16 },
    cardConfirmado: { borderWidth: 0.70489 },
    faixaSuperior: { width: '100%', height: 3, backgroundColor: '#F1EEE7' },
    conteudo: { width: '100%', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14.41 },
    conteudoValidade: { paddingBottom: 29.47 },
    conteudoRemovido: { opacity: 0.75 },
    cabecalho: { width: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconeTipo: { width: 36, height: 36, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderWidth: 0.70489, borderColor: '#E6E2D8', borderRadius: 10, backgroundColor: '#F7F5F0' },
    identificacao: { flex: 1, minWidth: 0 },
    nome: { color: '#222222', fontFamily: fontFamilies.bold, fontWeight: '700', fontSize: 16, lineHeight: 24 },
    tipo: { color: '#5C5C59', fontFamily: fontFamilies.regular, fontWeight: '400', fontSize: 13, lineHeight: 20 },
    acoes: { flexDirection: 'row', gap: 4, flexShrink: 0 },
    espacoAcao: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    escalaAcao: { width: 44, height: 44, transform: [{ scale: 36 / 44 }] },
    // Os slots dividem o espaço real; seus mínimos vêm do texto e padding originais.
    badges: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 6, marginTop: 12 },
    badgesConfirmado: { columnGap: 5.99 },
    espacoBadge: { flexGrow: 1, flexShrink: 0, minHeight: 23, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    divisor: { width: '100%', height: 1.40978, marginTop: 11.3, backgroundColor: '#E6E2D8' },
    blocoUsos: { width: '100%', marginTop: 7 },
    rotuloSecao: { color: '#B07D2A', fontFamily: fontFamilies.bold, fontWeight: '700', fontSize: 10, lineHeight: 15, letterSpacing: 0.6, marginBottom: 15 },
    linhaUso: { width: '100%', minHeight: 35.99, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    linhaUsoSeparada: { paddingTop: 14, marginTop: 14, borderTopWidth: 0.70489, borderTopColor: '#E6E2D8' },
    horarioComIcone: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, flexShrink: 1 },
    horario: { color: '#222222', fontFamily: fontFamilies.bold, fontWeight: '700', fontSize: 14, lineHeight: 21 },
    horarioConfirmado: { flex: 1, minWidth: 0, gap: 2 },
    confirmadoAs: { marginLeft: 17, color: '#5C5C59', fontFamily: fontFamilies.regular, fontWeight: '400', fontSize: 11, lineHeight: 16 },
    horaConfirmacao: { fontFamily: fontFamilies.semibold, fontWeight: '600' },
    espacoBotaoUso: { height: 35.99, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
    escalaBotaoUso: { height: 35.99 / (13 / 16), transform: [{ scale: 13 / 16 }] },
    botaoUso: { height: 35.99 / (13 / 16), borderRadius: 10 / (13 / 16), paddingHorizontal: 16 },
    botaoUsoConfirmado: { opacity: 0.31, borderWidth: 0 },
    bordaBotaoConfirmado: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 10, borderWidth: 1.40978, borderColor: '#CFCEC9' },
    historico: { width: '100%', marginTop: 3 },
    historicoRemovido: { marginTop: 17 },
    validade: { width: '100%', minHeight: 38, marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F7F5F0', borderRadius: 10 },
    textoValidade: { flex: 1, minWidth: 125, color: '#222222', fontFamily: fontFamilies.regular, fontWeight: '400', fontSize: 13, lineHeight: 20 },
    rotuloValidade: { fontFamily: fontFamilies.semibold, fontWeight: '600' }
});

export { estilosCartao };
