/**
 * Define os estados visuais normal, selecionado, pressionado e desativado da opção.
 */
import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        opcao: {
            width: '100%',
            minHeight: 64,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: tema.radius.buttonAndInput,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.borda,
            backgroundColor: tema.cores.interface.superficie,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
        },
        selecionada: {
            borderColor: tema.cores.interface.destaque,
            backgroundColor: tema.escuro ? tema.cores.interface.destaqueSuave : '#F0F5F2'
        },
        textos: { flex: 1 },
        titulo: { ...tema.typography.bodyDefault, color: tema.cores.interface.textoPrincipal },
        tituloSelecionado: {
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.semibold,
            fontWeight: '600'
        },
        descricao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19.5
        },
        indicador: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1.41,
            borderColor: tema.cores.interface.borda,
            alignItems: 'center',
            justifyContent: 'center'
        },
        indicadorSelecionado: {
            borderColor: tema.cores.interface.destaque,
            backgroundColor: tema.cores.interface.destaque
        },
        pressionado: { opacity: 0.65, transform: [{ scale: 0.98 }] },
        desativado: { opacity: 0.55 }
    });
}

export { criarEstilos };
