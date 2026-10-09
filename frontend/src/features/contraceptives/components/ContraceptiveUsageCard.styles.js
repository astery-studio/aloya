import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

const estilosCartao = StyleSheet.create({
    card: { width: '100%', overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1.41, borderColor: '#E6E2D8', borderRadius: 16 },
    faixaSuperior: { width: '100%', height: 3 },
    conteudo: { width: '100%', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 12 },
    cabecalho: { width: '100%', minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconeTipo: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 0.7, borderColor: '#E6E2D8', borderRadius: 10, backgroundColor: '#F7F5F0' },
    identificacao: { flex: 1, minWidth: 0 },
    nome: { color: '#222222', fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 24 },
    tipo: { color: '#5C5C59', fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 20 },
    acoes: { flexDirection: 'row', marginRight: -8 },
    badges: { width: '100%', flexDirection: 'row', gap: 10 },
    divisor: { width: '100%', height: StyleSheet.hairlineWidth, backgroundColor: '#E6E2D8' },
    blocoUsos: { width: '100%', gap: 6 },
    rotuloSecao: { color: '#B07D2A', fontFamily: fontFamilies.bold, fontSize: 10, lineHeight: 15, letterSpacing: 0.6 },
    linhaUso: { width: '100%', minHeight: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingVertical: 5, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0EDE7' },
    horarioComIcone: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    horario: { color: '#222222', fontFamily: fontFamilies.bold, fontSize: 14, lineHeight: 21 },
    horarioConfirmado: { flex: 1, gap: 1 },
    confirmadoAs: { marginLeft: 21, color: '#5C5C59', fontFamily: fontFamilies.regular, fontSize: 11, lineHeight: 16 },
    validade: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#F7F5F0', borderRadius: 10 },
    textoValidade: { flex: 1, color: '#222222', fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 20 },
    rotuloValidade: { fontFamily: fontFamilies.bold }
});

export { estilosCartao };
