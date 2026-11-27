import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import { StyleSheet } from 'react-native';

import { fontFamilies } from '../../../../shared/theme';

const CORES_CLARAS = Object.freeze({
    categoria: Object.freeze({
        conteudo: '#D68C3A',
        fundo: 'rgba(214, 140, 58, 0.20)'
    }),
    individual: Object.freeze({
        conteudo: '#4A758E',
        fundo: 'rgba(74, 117, 142, 0.20)'
    })
});

const CORES_ESCURAS = Object.freeze({
    categoria: CORES_CLARAS.categoria,
    individual: Object.freeze({
        conteudo: coresNoturnasConteudo.azul,
        fundo: 'rgba(144, 202, 249, 0.20)'
    })
});

function criarEstilos() {
    return StyleSheet.create({
        container: {
            minWidth: 0,
            width: '100%',
            height: 36,
            alignSelf: 'stretch',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingHorizontal: 14,
            borderRadius: 10
        },

        texto: {
            minWidth: 0,
            flexShrink: 1,
            fontFamily: fontFamilies.semibold,
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19.5,
            includeFontPadding: false
        }
    });
}

function criarVariantes(tema) {
    const cores = tema.escuro ? CORES_ESCURAS : CORES_CLARAS;

    return Object.freeze(
        Object.fromEntries(
            Object.entries(cores).map(([tipo, paleta]) => [
                tipo,
                Object.freeze({
                    container: Object.freeze({
                        backgroundColor: paleta.fundo
                    }),
                    conteudo: Object.freeze({
                        color: paleta.conteudo
                    })
                })
            ])
        )
    );
}

export { CORES_CLARAS, CORES_ESCURAS, criarEstilos, criarVariantes };
