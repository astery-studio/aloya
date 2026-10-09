import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

const estilosAcompanhamento = StyleSheet.create({
    tela: { flex: 1, backgroundColor: '#F7F5F0' },
    cabecalho: { width: '100%', minHeight: 105, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
    botaoVoltar: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titulo: { flex: 1, color: '#222222', fontFamily: fontFamilies.bold, fontSize: 26, lineHeight: 39, textAlign: 'center' },
    espacoCabecalho: { width: 44 },
    lista: { flexGrow: 1, width: '100%', maxWidth: 430, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 126 },
    rotuloSecao: { width: '100%', height: 34, flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12 },
    linhaRotulo: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#E6E2D8' },
    textoRotulo: { color: '#5C5C59', fontFamily: fontFamilies.bold, fontSize: 12, lineHeight: 18, letterSpacing: 0.72 },
    espacoCartao: { height: 12 },
    espacoSecao: { height: 8 },
    estadoCentral: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    mensagemEstado: { color: '#5C5C59', fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 22 },
    estadoVazio: { flex: 1, minHeight: 500, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35, paddingBottom: 70 },
    tituloVazio: { color: '#222222', fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 27, textAlign: 'center' },
    mensagemVazio: { maxWidth: 280, paddingTop: 10, color: '#5C5C59', fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 22, textAlign: 'center' },
    rodape: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 105, justifyContent: 'flex-end', paddingTop: 12, paddingHorizontal: 20, paddingBottom: 26, backgroundColor: '#F7F5F0', borderTopWidth: 0.7, borderTopColor: '#E6E2D8' }
});

export { estilosAcompanhamento };
