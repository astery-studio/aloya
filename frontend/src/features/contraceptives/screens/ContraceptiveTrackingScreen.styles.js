import { StyleSheet } from 'react-native';
import { coresNoturnasConteudo } from '../../../shared/theme/coresNoturnasConteudo';
import { TAMANHO_FAB } from '../../../shared/components/common/FloatingActionButton';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilosAcompanhamento(tema) {
    const interfaceTema = tema.cores.interface;
    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: tema.escuro ? '#121212' : interfaceTema.fundo },
        corpo: {
            flex: 1,
            minHeight: 0,
            paddingTop: tema.espacamentosLayout.headerParaConteudo
        },
        areaBanner: {
            width: '100%',
            maxWidth: 393.33,
            alignSelf: 'center',
            paddingHorizontal: 21.66,
            paddingBottom: 16
        },
        rolagem: { flex: 1 },
        lista: {
            flexGrow: 1,
            width: '100%',
            maxWidth: 393.33,
            alignSelf: 'center',
            paddingHorizontal: 21.66,
            paddingBottom: 32
        },
        espacoFab: {
            paddingBottom: TAMANHO_FAB + tema.espacamentos.grande + tema.espacamentos.pequeno
        },
        rotuloSecao: {
            width: '100%',
            height: 34,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingBottom: 16
        },
        rotuloSecaoSeguinte: { height: 54, paddingTop: 20 },
        linhaRotulo: {
            flex: 1,
            height: StyleSheet.hairlineWidth,
            backgroundColor: tema.escuro ? coresNoturnasConteudo.borda : interfaceTema.separador
        },
        textoRotulo: {
            color: tema.escuro
                ? coresNoturnasConteudo.textoSecundario
                : interfaceTema.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 0.72
        },
        espacoCartao: { height: 12 },
        estadoCentral: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            paddingTop: tema.espacamentosLayout.headerParaConteudo
        },
        mensagemEstado: {
            color: tema.escuro
                ? coresNoturnasConteudo.textoSecundario
                : interfaceTema.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            lineHeight: 22
        },
        estadoVazio: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: tema.espacamentosLayout.headerParaConteudo,
            paddingHorizontal: 22
        },
        tituloVazio: {
            color: tema.escuro
                ? coresNoturnasConteudo.textoPrincipal
                : interfaceTema.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            lineHeight: 27,
            textAlign: 'center'
        },
        mensagemVazio: {
            width: '100%',
            maxWidth: 310,
            paddingTop: 10,
            color: tema.escuro
                ? coresNoturnasConteudo.textoSecundario
                : interfaceTema.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            lineHeight: 22.5,
            textAlign: 'center'
        }
    });
}

const estilosAcompanhamento = criarEstilosAcompanhamento(temaClaro);

export { criarEstilosAcompanhamento, estilosAcompanhamento };
