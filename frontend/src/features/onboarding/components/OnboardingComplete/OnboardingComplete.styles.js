/**
 * Define os estilos da mensagem final e do logotipo.
 */
import { StyleSheet } from 'react-native';
import { fontFamilies, typography } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        fundo: { flex: 1 },
        tela: { flex: 1, paddingHorizontal: 24 },
        voltar: {
            alignSelf: 'flex-start',
            justifyContent: 'center',
            marginTop: 8,
            minHeight: 44,
            minWidth: 44
        },
        conteudo: { flex: 1, alignItems: 'center' },
        espacoSuperior: { flex: 1 },
        espacoInferior: { flex: 2.2 },
        titulo: {
            ...typography.h1,
            fontSize: 27,
            lineHeight: 32,
            color: tema.escuro ? '#E3E3E3' : tema.cores.interface.textoPrincipal,
            maxWidth: 342,
            textAlign: 'center'
        },
        marca: {
            color: tema.cores.marca.primaria,
            fontFamily: fontFamilies.bold,
            fontWeight: '900'
        },
        logo: {
            width: '100%',
            maxWidth: 300,
            height: 300,
            flexShrink: 1,
            marginTop: 28
        },
        rodape: { paddingTop: 12, paddingBottom: 24 }
    });
}

export { criarEstilos };
