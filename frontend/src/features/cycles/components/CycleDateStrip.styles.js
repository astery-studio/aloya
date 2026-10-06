import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    faixa: { gap: 8, paddingHorizontal: 24, paddingVertical: 12 },
    dia: { width: 44, alignItems: 'center', gap: 6, paddingVertical: 6, borderRadius: 14 },
    diaSelecionado: { backgroundColor: cores.marca.secundaria },
    semana: { color: cores.neutras.textoSecundarioClaro, fontFamily: fontFamilies.medium, fontSize: 12 },
    numero: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
    numeroSelecionado: { backgroundColor: 'transparent' },
    textoNumero: { color: cores.neutras.textoPrincipalClaro, fontFamily: fontFamilies.bold, fontSize: 15 },
    textoSelecionado: { color: cores.neutras.superficieClara },
    menstrual: { backgroundColor: '#F8DDD7' },
    folicular: { backgroundColor: '#E8F0EC' },
    ovulatoria: { backgroundColor: '#F8E9B9' },
    lutea: { backgroundColor: '#EDE6F8' },
    desconhecida: { backgroundColor: '#EDEDED' }
});

export { estilos };
