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
        corpo: {
            flex: 1,
            minHeight: 0
        },
        conteudo: {
            flex: 1,
            minHeight: 0,
            backgroundColor: tema.escuro ? '#1C1B19' : tema.cores.interface.fundo
        },
        areaCalendario: {
            flex: 1,
            minHeight: 0,
            position: 'relative'
        },
        avisoVazio: {
            position: 'absolute',
            top: 54,
            right: 20,
            left: 20,
            zIndex: 5,
            minHeight: 80,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: tema.cores.interface.destaque,
            borderRadius: 14,
            backgroundColor: tema.escuro ? '#232926' : '#EEF1ED'
        },
        textoVazio: {
            flex: 1,
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.medium,
            fontSize: 15,
            fontWeight: '500',
            lineHeight: 24
        },
        estadoCentral: {
            width: '100%',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: 76
        },
        botaoEstado: {
            width: '100%',
            height: 56,
            borderRadius: 12
        },
        textoDestaque: {
            fontFamily: fontFamilies.bold,
            fontWeight: '700'
        },
        areaSincronizacao: {
            flexShrink: 0,
            borderTopWidth: 1,
            borderTopColor: tema.escuro
                ? 'rgba(255, 255, 255, 0.08)'
                : tema.cores.interface.separador,
            backgroundColor: tema.escuro ? '#1E1E1E' : tema.cores.interface.fundo
        },
        navegacaoSegura: {
            flexShrink: 0,
            backgroundColor: tema.escuro ? '#1E1E1E' : '#FFFFFF'
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { coresConfiabilidadeEscuras, criarEstilos, estilos };
