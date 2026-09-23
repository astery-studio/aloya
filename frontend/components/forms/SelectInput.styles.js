/**
 * Aparência do campo de seleção usado nos formulários.
 */
import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius } from '../../theme';

const estilos = StyleSheet.create({
    campo: {
        width: '100%', maxWidth: 342, height: 56,
        alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, borderRadius: radius.buttonAndInput,
        borderWidth: 1.41, borderColor: cores.marca.primaria,
        backgroundColor: cores.neutras.superficieClara
    },
    conteudo: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10
    },
    texto: {
        color: cores.neutras.textoPrincipalClaro, textAlign: 'center',
        fontFamily: fontFamilies.regular, fontSize: 16, fontWeight: '400',
        lineHeight: 24, letterSpacing: 0.32
    },
    placeholder: { color: cores.neutras.textoSecundarioClaro },
    pressionado: { opacity: 0.72 },
    desativado: { opacity: 0.55 }
});

export { estilos };
