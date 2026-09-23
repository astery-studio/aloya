import { StyleSheet } from 'react-native';
import { cores, fontFamilies } from '../../../theme';

const estilos = StyleSheet.create({
    campos: { gap: 12 },
    termos: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
    caixa: {
        alignItems: 'center', backgroundColor: cores.neutras.superficieClara,
        borderColor: cores.neutras.bordaClara, borderRadius: 6,
        borderWidth: 1.41, height: 20, justifyContent: 'center', width: 20
    },
    caixaMarcada: {
        backgroundColor: cores.marca.primaria,
        borderColor: cores.marca.primaria
    },
    textoTermos: {
        color: cores.neutras.textoSecundarioClaro,
        flex: 1, fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 19.5
    },
    linkTermos: { color: cores.marca.primaria, fontFamily: fontFamilies.semibold },
    rodape: { gap: 24, width: '100%' },
    separador: { alignItems: 'center', flexDirection: 'row', gap: 12 },
    linha: { backgroundColor: cores.neutras.bordaClara, flex: 1, height: 1 },
    legenda: { color: cores.neutras.textoSecundarioClaro, fontSize: 13 }
});

export { estilos };
