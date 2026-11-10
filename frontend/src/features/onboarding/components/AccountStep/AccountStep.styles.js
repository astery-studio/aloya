/**
 * Define os estilos dos campos, termos e rodapé da etapa de conta.
 */
import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        campos: { gap: 12 },
        tiposConta: { gap: 8, marginBottom: 4 },
        tituloTiposConta: {
            color: tema.escuro ? '#E3E3E3' : tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            lineHeight: 22.5
        },
        campo: tema.escuro ? { borderColor: '#2C2C2C', backgroundColor: '#1E1E1E' } : {},
        textoCampo: tema.escuro ? { color: '#E3E3E3' } : {},
        labelCampo: tema.escuro ? { color: '#999999' } : {},
        titulo: tema.escuro ? { color: '#E3E3E3' } : {},
        botaoEntrar: tema.escuro ? { borderColor: '#C26E5F' } : {},
        textoEntrar: tema.escuro ? { color: '#C26E5F' } : {},
        termos: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
        caixa: {
            alignItems: 'center',
            backgroundColor: tema.escuro ? '#1E1E1E' : tema.cores.interface.superficie,
            borderColor: tema.escuro ? '#2C2C2C' : tema.cores.interface.borda,
            borderRadius: 6,
            borderWidth: 1.41,
            height: 20,
            justifyContent: 'center',
            width: 20
        },
        caixaMarcada: {
            backgroundColor: tema.escuro ? '#A5D6A7' : tema.cores.interface.destaque,
            borderColor: tema.escuro ? '#A5D6A7' : tema.cores.interface.destaque
        },
        textoTermos: {
            color: tema.escuro ? '#999999' : tema.cores.interface.textoSecundario,
            flex: 1,
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 19.5
        },
        linkTermos: {
            color: tema.escuro ? '#A5D6A7' : tema.cores.interface.destaque,
            fontFamily: fontFamilies.semibold
        },
        rodape: { gap: 24, width: '100%' },
        separador: { alignItems: 'center', flexDirection: 'row', gap: 12 },
        linha: {
            backgroundColor: tema.escuro ? '#FFFFFF14' : tema.cores.interface.borda,
            flex: 1,
            height: 1
        },
        legenda: {
            color: tema.escuro ? '#999999' : tema.cores.interface.textoSecundario,
            fontSize: 13
        }
    });
}

export { criarEstilos };
