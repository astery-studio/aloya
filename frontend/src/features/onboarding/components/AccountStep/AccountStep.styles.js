/**
 * Define os estilos dos campos, termos e rodapé da etapa de conta.
 */
import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        campos: { gap: 12 },
        termos: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
        caixa: {
            alignItems: 'center',
            backgroundColor: tema.cores.interface.superficie,
            borderColor: tema.cores.interface.borda,
            borderRadius: 6,
            borderWidth: 1.41,
            height: 20,
            justifyContent: 'center',
            width: 20
        },
        caixaMarcada: {
            backgroundColor: tema.cores.interface.destaque,
            borderColor: tema.cores.interface.destaque
        },
        textoTermos: {
            color: tema.cores.interface.textoSecundario,
            flex: 1,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19.5
        },
        linkTermos: { color: tema.cores.interface.destaque, fontFamily: fontFamilies.semibold },
        rodape: { gap: 24, width: '100%' },
        separador: { alignItems: 'center', flexDirection: 'row', gap: 12 },
        linha: { backgroundColor: tema.cores.interface.borda, flex: 1, height: 1 },
        legenda: { color: tema.cores.interface.textoSecundario, fontSize: 13 }
    });
}

export { criarEstilos };
