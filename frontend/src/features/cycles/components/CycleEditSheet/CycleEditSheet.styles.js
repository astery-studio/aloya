import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../../shared/theme';
function criarEstilos(tema) {
    const branco = tema.escuro ? '#1E1E1E' : '#FFFFFF';
    const borda = tema.escuro ? 'rgba(255, 255, 255, 0.08)' : '#E6E2D8';
    return StyleSheet.create({
        painel: { flexShrink: 1, backgroundColor: branco },
        titulo: {
            fontFamily: fontFamilies.bold,
            fontSize: 17,
            lineHeight: 26,
            color: tema.escuro ? '#E3E3E3' : tema.cores.interface.textoPrincipal,
            textAlign: 'center',
            paddingTop: 20,
            paddingBottom: 8,
            paddingHorizontal: 24
        },
        rolagem: { flexShrink: 1 },
        conteudo: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
        calendario: {
            borderWidth: 1.41,
            borderColor: borda,
            borderRadius: 16,
            backgroundColor: tema.escuro ? '#242424' : branco,
            paddingTop: 16,
            paddingBottom: 14,
            paddingHorizontal: 14,
            overflow: 'hidden'
        },
        aviso: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            marginTop: 16,
            paddingHorizontal: 10,
            minHeight: 53,
            borderRadius: 10,
            backgroundColor: tema.escuro ? 'rgba(255, 255, 255, 0.08)' : '#F7F5F0'
        },
        instrucao: {
            flex: 1,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18,
            color: tema.escuro ? '#999999' : tema.cores.interface.textoSecundario
        },
        rodape: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: borda,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 20,
            gap: 8
        },
        concluir: {
            height: 48,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.escuro ? '#C26E5F' : '#C85A44'
        },
        textoConcluir: {
            fontFamily: fontFamilies.semibold,
            fontSize: 15,
            lineHeight: 22,
            color: tema.escuro ? '#121212' : '#FFFFFF'
        },
        desativado: { backgroundColor: tema.escuro ? '#2C2C2C' : '#E6E2D8' },
        textoDesativado: { color: tema.escuro ? '#757575' : '#A09D96' },
        descartar: {
            height: 54,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: borda,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tema.escuro ? '#242424' : branco
        },
        textoDescartar: {
            fontFamily: fontFamilies.medium,
            fontSize: 16,
            lineHeight: 24,
            color: tema.escuro ? '#E3E3E3' : tema.cores.interface.textoSecundario
        }
    });
}
export { criarEstilos };
