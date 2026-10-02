//Define somente o visual básico do acesso provisório às HU-021 e HU-022.
import { StyleSheet } from 'react-native';
import { cores, espacamentos, fontFamilies } from '../../../shared/theme';

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: cores.neutras.fundoClaro
    },

    lista: {
        flexGrow: 1,
        gap: espacamentos.medio,
        padding: espacamentos.grande
    },

    item: {
        minHeight: 72,
        padding: espacamentos.medio,
        borderWidth: 1,
        borderColor: cores.neutras.bordaClara,
        borderRadius: 12,
        backgroundColor: cores.neutras.superficieClara,
        justifyContent: 'center'
    },

    itemPressionado: {
        opacity: 0.65
    },

    nome: {
        color: cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.medium,
        fontSize: 16,
        lineHeight: 24
    },

    acao: {
        color: cores.marca.secundaria,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21
    },

    estado: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: espacamentos.medio,
        padding: espacamentos.grande
    },

    textoEstado: {
        color: cores.neutras.textoSecundarioClaro,
        fontFamily: fontFamilies.regular,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center'
    }
});

export { estilos };