import { StyleSheet } from 'react-native';
import { tema, fontFamilies } from '../../theme';

const estilos = StyleSheet.create({
    container: {
        flexShrink: 1
    },

    cabecalho: {
        minHeight: 62,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela
    },
    cabecalhoCompacto: {
        height: 54,
        minHeight: 54,
        paddingTop: 0
    },

    titulo: {
        flex: 1,
        flexShrink: 1,
        color: tema.cores.neutras.textoPrincipalClaro,
        fontFamily: fontFamilies.bold,
        fontSize: 18,
        lineHeight: 27
    },
    tituloCompacto: {
        fontSize: 17,
        lineHeight: 26
    },

    botaoFechar: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    botaoFecharCompacto: {
        width: 36,
        height: 36,
        marginRight: -8
    },

    conteudo: {
        flexShrink: 1,
        paddingHorizontal: tema.espacamentosLayout.margemHorizontalTela
    }
});

const corIconeFechar = tema.cores.neutras.textoSecundarioClaro;

export { estilos, corIconeFechar };
