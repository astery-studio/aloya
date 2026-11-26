// Define o cabeçalho compacto e a distribuição vertical da tela do calendário.
import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

const coresConfiabilidadeEscuras = Object.freeze({
    baixa: {
        cor: '#EF9A9A',
        fundo: 'rgba(239, 154, 154, 0.16)',
        borda: 'rgba(239, 154, 154, 0.33)'
    },
    media: {
        cor: '#FFE082',
        fundo: 'rgba(255, 224, 130, 0.16)',
        borda: 'rgba(255, 224, 130, 0.33)'
    },
    alta: { cor: '#A5D6A7', fundo: 'rgba(165, 214, 167, 0.14)', borda: 'rgba(165, 214, 167, 0.33)' }
});

function criarEstilos(tema) {
    return StyleSheet.create({
        tela: {
            flex: 1,
            backgroundColor: tema.escuro ? '#1C1B19' : tema.cores.interface.fundo
        },
        acaoLegenda: {
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center'
        },
        centralizadorConfianca: {
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center'
        },
        corIconeCabecalho: tema.cores.interface.textoSecundario,
        conteudo: {
            flex: 1,
            minHeight: 0,
            paddingTop: tema.espacamentosLayout.headerParaConteudo,
            backgroundColor: tema.escuro ? '#1C1B19' : tema.cores.interface.fundo
        },
        areaCalendario: {
            flex: 1,
            minHeight: 0
        },
        avisoVazio: {
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            marginHorizontal: 20,
            paddingHorizontal: 12,
            paddingVertical: 11,
            borderWidth: 0.7,
            borderColor: tema.cores.interface.destaque,
            borderRadius: 12,
            backgroundColor: tema.escuro ? 'transparent' : 'rgba(44, 76, 59, 0.05)'
        },
        textoVazio: {
            flex: 1,
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.medium,
            fontSize: 13,
            lineHeight: 19
        },
        botaoCadastrarMenstruacao: tema.escuro ? { backgroundColor: '#C26E5F' } : {},
        textoCadastrarMenstruacao: tema.escuro ? { color: '#121212' } : {},
        rodape: {
            flexShrink: 0,
            paddingTop: 20,
            paddingRight: 24,
            paddingBottom: 24,
            paddingLeft: 24,
            borderTopWidth: 1,
            borderTopColor: tema.escuro
                ? 'rgba(255, 255, 255, 0.08)'
                : tema.cores.interface.separador,
            backgroundColor: tema.escuro ? '#1E1E1E' : tema.cores.interface.fundo
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { coresConfiabilidadeEscuras, criarEstilos, estilos };
