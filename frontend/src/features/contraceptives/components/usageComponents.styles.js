import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

const estilosUso = StyleSheet.create({
    banner: { width: '100%', height: 39.41, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#FBF3E0', borderWidth: 0.70489, borderColor: '#E8C97A' },
    textoBanner: { color: '#B07D2A', fontFamily: fontFamilies.semibold, fontSize: 13, lineHeight: 20 },
    painel: { width: '100%' },
    cabecalhoPainel: { height: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 10 },
    tituloPainel: { color: '#5C5C59', fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 18 },
    conteudoPainel: { width: '100%', alignItems: 'center', paddingTop: 8 },
    listaRegistros: { width: '100%', maxWidth: 315.21, gap: 6 },
    registro: { width: '100%', minHeight: 95, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#F7F5F0', borderRadius: 10 },
    cabecalhoRegistro: { width: '100%', height: 23, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dataRegistro: { color: '#222222', fontFamily: fontFamilies.bold, fontSize: 13, lineHeight: 20 },
    linhaHorario: { width: '100%', height: 26, flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8 },
    linhaConfirmacao: { width: '100%', height: 22, flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 },
    rotuloHorario: { color: '#5C5C59', fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 18 },
    horaRegistro: { color: '#222222', fontFamily: fontFamilies.semibold, fontSize: 12, lineHeight: 18 },
    calendario: { width: '100%', maxWidth: 315.21, minHeight: 256.43, padding: 8, backgroundColor: '#F7F5F0', borderRadius: 12 },
    cabecalhoCalendario: { width: '100%', height: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    botaoMes: { width: 26, height: 22, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, paddingHorizontal: 6 },
    setaProximo: { transform: [{ rotate: '180deg' }] },
    tituloMes: { color: '#222222', fontFamily: fontFamilies.bold, fontSize: 12, lineHeight: 18, textTransform: 'capitalize' },
    gradeCalendario: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', paddingTop: 6 },
    diaSemana: { width: '14.2857%', height: 13.49, color: '#AAAAA5', fontFamily: fontFamilies.semibold, fontSize: 9, lineHeight: 14, textAlign: 'center' },
    celulaDia: { width: '14.2857%', height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
    numeroDia: { color: '#222222', fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 12, textAlign: 'center' },
    diaComEstado: { color: '#FFFFFF' },
    celula_confirmado: { backgroundColor: 'rgba(44, 76, 59, 0.8)' },
    celula_foraDoPrazo: { backgroundColor: 'rgba(214, 140, 58, 0.8)' },
    celula_naoConfirmado: { backgroundColor: 'rgba(200, 90, 68, 0.8)' },
    legenda: { width: '100%', height: 23, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 8, paddingHorizontal: 13 },
    itemLegenda: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    marcadorLegenda: { width: 5.99, height: 5.99, borderRadius: 2.995 },
    marcador_confirmado: { backgroundColor: 'rgba(44, 76, 59, 0.8)' },
    marcador_foraDoPrazo: { backgroundColor: 'rgba(214, 140, 58, 0.8)' },
    marcador_naoConfirmado: { backgroundColor: 'rgba(200, 90, 68, 0.8)' },
    textoLegenda: { color: '#5C5C59', fontFamily: fontFamilies.regular, fontSize: 10, lineHeight: 15 }
});

export { estilosUso };
