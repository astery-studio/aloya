import { StyleSheet } from 'react-native';
import { coresNoturnasConteudo } from '../../../theme/coresNoturnasConteudo';

const COR_FAB = '#C85A44';
const COR_ICONE_FAB = '#FFFFFF';
const TAMANHO_FAB = 56;

function criarEstilos(tema) {
    return {
        ...StyleSheet.create({
            posicionador: {
                position: 'absolute',
                right: tema.espacamentos.grande,
                zIndex: 1
            },
            botao: {
                width: TAMANHO_FAB,
                height: TAMANHO_FAB,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 28,
                borderWidth: 2,
                borderColor: 'transparent',
                backgroundColor: tema.escuro ? coresNoturnasConteudo.coral : COR_FAB,
                ...tema.shadows.cardSuave,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.22,
                shadowRadius: 10,
                elevation: 8
            },
            pressionado: {
                transform: [{ scale: 0.95 }]
            },
            desativado: {
                opacity: 0.45
            },
            focado: {
                borderColor: tema.cores.interface.textoPrincipal
            }
        }),
        corIcone: tema.escuro ? coresNoturnasConteudo.fundo : COR_ICONE_FAB
    };
}

export { COR_FAB, COR_ICONE_FAB, TAMANHO_FAB, criarEstilos };
