import { StyleSheet } from 'react-native';
import { espacamentos, fontFamilies, typography } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: tema.cores.interface.fundo },
        areaRolagem: { flex: 1 },
        cabecalho: {
            width: '100%',
            minHeight: 78,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: espacamentos.medio,
            paddingTop: espacamentos.extraGrande
        },
        titulo: {
            ...typography.h2,
            flexShrink: 1,
            color: tema.cores.interface.textoPrincipal,
            fontWeight: '700',
            lineHeight: 28
        },
        rolagem: { flexGrow: 1, paddingBottom: espacamentos.medio },
        carregando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
        textoCarregando: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 21
        },
        navegacaoSegura: { flexShrink: 0, backgroundColor: tema.cores.interface.superficie }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
