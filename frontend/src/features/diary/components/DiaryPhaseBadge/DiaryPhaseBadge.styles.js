import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    chip: {
        alignSelf: 'center',
        width: 294,
        height: 36,
        marginTop: 8,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
    },
    texto: {
        fontFamily: fontFamilies.semiBold,
        fontSize: 13,
        lineHeight: 18
    }
});

export { estilos };
