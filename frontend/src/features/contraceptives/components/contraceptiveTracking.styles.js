import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../shared/theme';

const estilosAcompanhamento = StyleSheet.create({
    card: { width: '100%', padding: 16, gap: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E2D8', borderRadius: 16 },
    cardPendente: { borderLeftWidth: 4, borderLeftColor: '#B07D2A' },
    cabecalhoCard: { width: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 },
    identificacao: { flex: 1, minWidth: 0 },
    nome: { color: '#222222', fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 24 },
    tipo: { color: '#5C5C59', fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 20 },
    badges: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    validade: { color: '#2C4C3B', fontFamily: fontFamilies.bold, fontSize: 13, lineHeight: 20, paddingVertical: 4 },
    listaUsos: { width: '100%', gap: 6 },
    rotuloSecao: { color: '#B07D2A', fontFamily: fontFamilies.bold, fontSize: 10, lineHeight: 15, letterSpacing: 0.6 },
    uso: { width: '100%', minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0EDE7' },
    usoConfirmado: { opacity: 0.78 },
    pressionado: { opacity: 0.6 },
    iconeUso: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#F7F5F0', borderWidth: 1, borderColor: '#E6E2D8' },
    iconeUsoConfirmado: { backgroundColor: '#2C4C3B', borderColor: '#2C4C3B' },
    textoUso: { flex: 1 },
    horarioUso: { color: '#222222', fontFamily: fontFamilies.bold, fontSize: 14, lineHeight: 21 },
    estadoUso: { color: cores.neutras?.textoSecundarioClaro ?? '#5C5C59', fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 18 }
});

export { estilosAcompanhamento };
