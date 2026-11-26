import { StyleSheet } from 'react-native';
import { espacamentos, fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema, insetSuperior = 0) {
    const alturaCabecalho = 111.99 - insetSuperior;
    const paddingSuperiorCabecalho = Math.max(0, 55.99 - insetSuperior);

    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: tema.escuro ? '#121212' : tema.cores.interface.fundo },
        areaRolagem: { flex: 1 },
        cabecalho: {
            width: '100%',
            height: alturaCabecalho,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: espacamentos.medio,
            paddingTop: paddingSuperiorCabecalho,
            paddingBottom: 12
        },
        acoesCabecalho: { flexDirection: 'row', gap: espacamentos.pequeno },
        titulo: {
            flexShrink: 1,
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 24,
            fontWeight: '700',
            includeFontPadding: false,
            lineHeight: 28
        },
        rolagem: { flexGrow: 1 },
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
