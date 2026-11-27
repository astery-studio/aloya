import { coresNoturnasConteudo } from '../../../shared/theme/coresNoturnasConteudo';
//Define a estrutura visual da listagem da Rede de Apoio.
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            flex: 1,
            minHeight: 0,
            backgroundColor: tema.escuro ? coresNoturnasConteudo.fundo : tema.cores.interface.fundo
        },

        apresentacao: {
            width: '100%',
            maxWidth: 350.011,
            alignSelf: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tema.espacamentosLayout.descricaoParaConteudo,
            marginBottom: tema.espacamentosLayout.descricaoParaConteudo
        },

        descricao: {
            width: '100%',
            color: tema.escuro
                ? coresNoturnasConteudo.textoSecundario
                : tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontSize: 15,
            fontWeight: '400',
            lineHeight: 22.5,
            includeFontPadding: false
        },

        botaoLimpar: {
            width: '100%',
            maxWidth: 350.011,
            height: 35.99,
            flexShrink: 0,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: tema.escuro ? coresNoturnasConteudo.coral : '#C85A44',
            borderRadius: 10
        },

        textoBotaoLimpar: {
            color: tema.escuro ? coresNoturnasConteudo.coral : '#C85A44',
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 25.5,
            textAlign: 'center'
        },

        areaLista: {
            flex: 1,
            minHeight: 0
        }
    });
}

export { criarEstilos };
