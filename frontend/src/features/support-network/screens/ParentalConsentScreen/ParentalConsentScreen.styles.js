import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            gap: tema.espacamentos.grande
        },
        secao: {
            width: '100%',
            gap: tema.espacamentos.pequeno
        },
        tituloSecao: {
            marginLeft: 4,
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 21
        },
        campoCadastro: {
            width: '100%',
            minHeight: 65,
            justifyContent: 'center',
            paddingHorizontal: tema.espacamentos.medio,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: tema.escuro ? 0.705 : 0.7,
            borderColor: tema.escuro ? '#2C2C2C' : tema.cores.interface.borda,
            backgroundColor: tema.escuro ? '#1E1E1E' : tema.cores.interface.superficie
        },
        labelCampo: {
            color: tema.escuro ? '#999999' : '#5C5C59',
            fontFamily: fontFamilies.regular,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 21
        },
        entradaCadastro: {
            ...tema.typography.bodyDefault,
            minHeight: 24,
            padding: 0,
            color: tema.escuro ? '#E3E3E3' : tema.cores.interface.textoPrincipal
        },
        botaoSalvarDesativado: tema.escuro ? { borderRadius: 12, backgroundColor: '#2C2C2C' } : {},
        textoSalvarDesativado: tema.escuro ? { color: '#757575' } : {},
        caixaCampoEdicao: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 1.41,
                  borderColor: '#A5D6A7',
                  backgroundColor: '#2C2C2C'
              }
            : {},
        textoCampoEdicao: tema.escuro ? { color: '#999999' } : {},
        painelEdicao: tema.escuro
            ? {
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  boxShadow: '0 -4px 32px 0 rgba(34, 34, 34, 0.10)'
              }
            : {}
    });
}

export { criarEstilos };
