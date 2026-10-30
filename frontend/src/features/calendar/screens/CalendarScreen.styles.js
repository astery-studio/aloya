// Define o cabeçalho compacto e a distribuição vertical da tela do calendário.
import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        tela: {
            flex: 1,
            backgroundColor: tema.cores.interface.fundo
        },
        cabecalho: {
            display: 'flex',
            height: 139,
            paddingTop: 56,
            paddingRight: 20,
            paddingBottom: 8,
            paddingLeft: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            alignSelf: 'stretch'
        },
        acaoCabecalho: {
            width: 32,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center'
        },
        acaoLegenda: {
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center'
        },
        centralizadorCabecalho: {
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            height: 75,
            alignItems: 'center',
            justifyContent: 'center'
        },
        caixaCalendario: {
            display: 'flex',
            width: 288,
            maxWidth: '82%',
            height: 75,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        },
        tituloEConfianca: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
        },
        centralizadorConfianca: {
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center'
        },
        titulo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.bold,
            fontSize: 28,
            fontWeight: '700',
            lineHeight: 34,
            textAlign: 'center'
        },
        corIconeCabecalho: tema.cores.interface.textoSecundario,
        conteudo: {
            flex: 1,
            minHeight: 0,
            backgroundColor: tema.cores.interface.fundo
        },
        areaCalendario: {
            flex: 1,
            minHeight: 0
        },
        avisoVazio: {
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: tema.escuro ? 'rgba(242, 180, 95, 0.16)' : 'rgba(214, 140, 58, 0.14)'
        },
        textoVazio: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 21
        },
        rodape: {
            flexShrink: 0,
            paddingTop: 20,
            paddingRight: 24,
            paddingBottom: 24,
            paddingLeft: 24,
            borderTopWidth: 1,
            borderTopColor: tema.cores.interface.separador,
            backgroundColor: tema.cores.interface.fundo
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
