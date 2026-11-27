import { StyleSheet } from 'react-native';
import { espacamentosLayout } from '../../../../shared/theme';

const estilos = StyleSheet.create({
    conteudo: {
        width: '100%',
        paddingTop: espacamentosLayout.headerParaConteudo,
        paddingBottom: 24
    },

    carregamento: {
        width: '100%',
        minHeight: 320,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export { estilos };
