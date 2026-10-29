import { StyleSheet } from 'react-native';

import { fontFamilies, tema } from '../../../shared/theme';

const estilos = StyleSheet.create({
    grupo: {
        gap: tema.espacamentos.pequeno
    },
    erro: {
        paddingHorizontal: tema.espacamentos.medio,
        color: tema.cores.feedback.erro,
        fontFamily: fontFamilies.regular,
        fontSize: 12,
        lineHeight: 18
    },
    erroEdicao: {
        marginTop: tema.espacamentos.pequeno,
        color: tema.cores.feedback.erro,
        fontFamily: fontFamilies.regular,
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center'
    },
    acao: {
        width: '100%',
        marginTop: tema.espacamentos.grande
    }
});

export { estilos };
