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
        posicionadorAvisoVazio: {
            position: 'absolute',
            top: 40,
            right: 0,
            left: 0,
            zIndex: 5,
            alignItems: 'center',
            paddingHorizontal: 20
        },
        avisoVazio: {
            display: 'flex',
            width: '100%',
            maxWidth: 349.991,
            paddingVertical: 10,
            paddingHorizontal: 12,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 9,
            borderRadius: 12,
            backgroundColor: tema.escuro ? '#232926' : '#E3E4DE',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 6
        },
        textoVazio: {
            width: '100%',
            color: tema.cores.interface.destaque,
            fontFamily: fontFamilies.medium,
            fontSize: 15,
            fontWeight: '500',
            lineHeight: 24,
            textAlign: 'center'
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
            position: 'absolute',
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 5,
            alignItems: 'center',
            paddingHorizontal: 15.33
        },
        navegacaoSegura: {
            flexShrink: 0,
            backgroundColor: tema.escuro ? '#1E1E1E' : '#FFFFFF'
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { coresConfiabilidadeEscuras, criarEstilos, estilos };
