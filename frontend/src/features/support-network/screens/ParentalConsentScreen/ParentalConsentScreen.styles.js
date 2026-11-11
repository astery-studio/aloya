import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        secao: {
            width: '100%',
            gap: 12
        },
        tituloSecao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.bold,
            fontSize: 12,
            fontWeight: '700',
            lineHeight: 18,
            letterSpacing: 0.72,
            textTransform: 'uppercase'
        },
        campo: {
            minHeight: 72,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: tema.cores.interface.borda,
            borderRadius: 14,
            backgroundColor: tema.cores.interface.superficie
        },
        textos: {
            flex: 1,
            gap: 3
        },
        label: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 21
        },
        valor: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21
        },
        valorVazio: {
            color: tema.cores.interface.textoDesabilitado
        },
        icone: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center'
        },
        descricao: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            lineHeight: 21
        },
        rodape: {
            width: '100%'
        }
    });
}

export { criarEstilos };
