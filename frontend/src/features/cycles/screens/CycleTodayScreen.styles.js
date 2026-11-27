import { StyleSheet } from 'react-native';
import { espacamentos, fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: tema.escuro ? '#121212' : tema.cores.interface.fundo },
        areaRolagem: { flex: 1 },
        cabecalho: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: espacamentos.medio,
            paddingHorizontal: espacamentos.medio,
            paddingTop: tema.espacamentosLayout.espacamentoSuperiorHeader,
            paddingBottom: tema.espacamentosLayout.espacamentoInferiorHeader,
            marginBottom: tema.espacamentosLayout.headerParaConteudo
        },
        acoesCabecalho: { flexDirection: 'row', gap: espacamentos.pequeno },
        titulo: {
            fontFamily: fontFamilies.bold,
            fontSize: 24,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 27.5,
            textAlign: 'left',
            minWidth: 0,
            flex: 1,
            flexShrink: 1,
            color: '#222222'
        },
        rolagem: {
            flexGrow: 1,
            paddingBottom: espacamentos.medio
        },
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
