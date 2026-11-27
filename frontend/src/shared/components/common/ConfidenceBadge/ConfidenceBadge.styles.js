//Define o visual das variantes simples e composta da confiabilidade.
import { StyleSheet } from 'react-native';
import { coresNoturnasConteudo } from '../../../theme/coresNoturnasConteudo';

import { fontFamilies } from '../../../theme';

function criarEstilos(tema) {
    const estilos = StyleSheet.create({
        container: {
            alignSelf: 'flex-start',
            flexShrink: 0
        },

        simples: {
            height: 34,
            minWidth: 112.33,
            maxWidth: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingHorizontal: 10,
            borderWidth: 0.666667,
            borderRadius: 16
        },

        composta: {
            width: 140.33,
            height: 59.33,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            gap: 4,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderWidth: 0.666667,
            borderRadius: 16
        },

        linha: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
        },

        textoSimples: {
            flexShrink: 1,
            fontFamily: fontFamilies.medium,
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: 21,
            includeFontPadding: false
        },

        rotulo: {
            flexShrink: 1,
            fontFamily: fontFamilies.medium,
            fontSize: 11,
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: 16,
            letterSpacing: 0.45,
            includeFontPadding: false
        },

        nivel: {
            flexShrink: 1,
            fontFamily: fontFamilies.semibold,
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: 20,
            includeFontPadding: false
        }
    });

    const variantes = tema.escuro
        ? Object.freeze({
              alta: Object.freeze({
                  cor: coresNoturnasConteudo.verde,
                  fundo: 'rgba(165, 214, 167, 0.14)',
                  borda: 'rgba(165, 214, 167, 0.45)'
              }),
              media: Object.freeze({
                  cor: '#D68C3A',
                  fundo: 'rgba(214, 140, 58, 0.14)',
                  borda: 'rgba(214, 140, 58, 0.45)'
              }),
              baixa: Object.freeze({
                  cor: coresNoturnasConteudo.coral,
                  fundo: 'rgba(194, 110, 95, 0.14)',
                  borda: 'rgba(194, 110, 95, 0.45)'
              })
          })
        : Object.freeze({
              alta: Object.freeze({
                  cor: '#2C4C3B',
                  fundo: 'rgba(44, 76, 59, 0.1)',
                  borda: 'rgba(44, 76, 59, 0.333)'
              }),

              media: Object.freeze({
                  cor: '#D68C3A',
                  fundo: 'rgba(214, 140, 58, 0.1)',
                  borda: 'rgba(214, 140, 58, 0.333)'
              }),

              baixa: Object.freeze({
                  cor: '#C85A44',
                  fundo: 'rgba(200, 90, 68, 0.1)',
                  borda: 'rgba(200, 90, 68, 0.333)'
              })
          });

    return { estilos, variantes };
}

export { criarEstilos };
