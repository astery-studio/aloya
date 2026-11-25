import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';

export const estilos = StyleSheet.create({
    lista: { gap: 24 },
    secao: { gap: 8 },
    titulo: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 21, paddingLeft: 4 },
    campo: { minHeight: 57, borderWidth: 0.7, borderRadius: 12, paddingHorizontal: 12 },
    rotulo: { fontFamily: fontFamilies.regular, fontWeight: '400', fontSize: 16, lineHeight: 24 }
});
