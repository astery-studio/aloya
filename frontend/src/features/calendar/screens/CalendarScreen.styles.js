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
        conteudo: {
            flex: 1,
            minHeight: 0,
            backgroundColor: tema.escuro ? '#1C1B19' : tema.cores.interface.fundo
        },
        areaCalendario: {
            flex: 1,
            minHeight: 0
        },
        estadoVazio: {
            width: '100%',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: 76
        },
        textoDestaque: {
            fontFamily: fontFamilies.bold,
            fontWeight: '700'
        },
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
