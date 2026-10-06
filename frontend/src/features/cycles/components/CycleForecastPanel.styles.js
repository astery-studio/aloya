import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius, shadows } from '../../../shared/theme';

const estilos = StyleSheet.create({
    conteudo: { alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingBottom: 32 },
    simbolo: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center', borderRadius: 66, backgroundColor: '#EDEDED', marginTop: 12 },
    simbolo_menstrual: { backgroundColor: '#F8DDD7' },
    simbolo_folicular: { backgroundColor: '#E8F0EC' },
    simbolo_ovulatoria: { backgroundColor: '#F8E9B9' },
    simbolo_lutea: { backgroundColor: '#EDE6F8' },
    simboloTexto: { color: cores.marca.secundaria, fontFamily: fontFamilies.regular, fontSize: 56 },
    titulo: { color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold, fontSize: 24, lineHeight: 30, textAlign: 'center' },
    diaCiclo: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.medium, fontSize: 15 },
    descricao: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 21, textAlign: 'center' },
    acoes: { width: '100%', gap: 10, marginTop: 8 },
    previsoes: { width: '100%', gap: 12, marginTop: 12 },
    cartao: { width: '100%', gap: 7, padding: 16, backgroundColor: cores.neutras.superficieClara, borderRadius: radius.buttonAndInput, borderWidth: 1, borderColor: cores.neutras.bordaClara, ...shadows.popup },
    rotulo: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.medium, fontSize: 13 },
    valor: { color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 24 },
    confianca: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    confianca_baixa: { backgroundColor: '#F8DDD7' },
    confianca_media: { backgroundColor: '#FBF3E0' },
    confianca_alta: { backgroundColor: '#E8F0EC' },
    confiancaTexto: { color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold, fontSize: 12, textTransform: 'capitalize' },
    incentivo: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 18 },
    alerta: { color: cores.feedback.erro, fontFamily: fontFamilies.bold, fontSize: 13, lineHeight: 18 },
    aviso: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 19, textAlign: 'center', paddingHorizontal: 8 },
    explicacao: { width: '100%', gap: 8, marginTop: 12 },
    subtitulo: { color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 24 },
    item: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 22 }
});

export { estilos };
