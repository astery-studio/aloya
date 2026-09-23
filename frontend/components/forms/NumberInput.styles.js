/**
 * Aparência do campo numérico com unidade fixa.
 */
import { StyleSheet } from 'react-native';
import { cores, fontFamilies, radius } from '../../theme';

const texto = {
    color: cores.neutras.textoPrincipalClaro,
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.32
};

const estilos = StyleSheet.create({
    campo: {
        width: '100%', maxWidth: 342, height: 56,
        alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, borderRadius: radius.buttonAndInput,
        borderWidth: 1.41, borderColor: cores.marca.primaria,
        backgroundColor: cores.neutras.superficieClara
    },
    conteudo: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4
    },
    entrada: { ...texto, minWidth: 24, padding: 0, textAlign: 'right' },
    unidade: { ...texto },
    desativado: { opacity: 0.55 }
});

export { estilos };
