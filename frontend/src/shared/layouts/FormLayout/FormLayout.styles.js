/**
 * Define a estrutura visual e o alinhamento opcional do FormLayout.
 */
import { StyleSheet } from 'react-native';
import { espacamentos } from '../../theme';

const estilos = StyleSheet.create({
    fundo: { flex: 1 },
    tela: { flex: 1, backgroundColor: 'transparent' },
    flexivel: { flex: 1 },
    rolagem: {
        flexGrow: 1,
        paddingHorizontal: espacamentos.grande,
        paddingVertical: espacamentos.extraGrande,
        width: '100%'
    },
    centralizado: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    acoes: {
        paddingHorizontal: espacamentos.grande,
        paddingTop: 32,
        paddingBottom: 40,
        width: '100%'
    }
});

export { estilos };
