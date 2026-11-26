import { screen } from '@testing-library/react-native';
import {
    CyclePhaseArtwork,
    IMAGENS_DAS_FASES
} from '../../../../src/features/cycles/components/home/CyclePhaseArtwork';
import {
    CORES_DAS_FASES,
    COR_SEGMENTO_INATIVO,
    criarSegmentosDaMoldura
} from '../../../../src/features/cycles/components/home/CyclePhaseFrame';
import {
    RAIO_INTERNO_MOLDURA,
    TAMANHO_ARTE,
    TAMANHO_MASCARA
} from '../../../../src/features/cycles/components/home/CyclePhaseArtwork.styles';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const FASES = ['menstrual', 'folicular', 'ovulatoria', 'lutea'];

test.each(FASES)('apresenta a imagem e a moldura da fase %s em 260 por 260', async (fase) => {
    await render(<CyclePhaseArtwork fase={fase} diaCiclo={11} duracaoCiclo={28} />);

    expect(screen.getByTestId('cycle-phase-artwork')).toHaveStyle({
        width: TAMANHO_ARTE,
        height: TAMANHO_ARTE
    });
    expect(screen.getByTestId('cycle-phase-image')).toHaveProp('source', IMAGENS_DAS_FASES[fase]);
    expect(screen.getByTestId('cycle-phase-image')).toHaveStyle({
        width: 260,
        height: 260
    });
    expect(screen.getByTestId('cycle-phase-frame')).toHaveProp('width', 260);
    expect(screen.getByTestId('cycle-phase-frame')).toHaveProp('height', 260);
});

test('recorta a imagem pelo limite interno circular da moldura', async () => {
    await render(<CyclePhaseArtwork fase="ovulatoria" diaCiclo={11} duracaoCiclo={28} />);

    expect(screen.getByTestId('cycle-phase-image-mask')).toHaveStyle({
        width: TAMANHO_MASCARA,
        height: TAMANHO_MASCARA,
        borderRadius: RAIO_INTERNO_MOLDURA,
        overflow: 'hidden'
    });
});

test.each(FASES)('cria um traço por dia e colore até o dia atual na fase %s', async (fase) => {
    await render(<CyclePhaseArtwork fase={fase} diaCiclo={11} duracaoCiclo={28} />);

    const segmentosRenderizados = screen.getAllByTestId('cycle-phase-frame-segment');
    const segmentos = criarSegmentosDaMoldura({ fase, diaCiclo: 11, duracaoCiclo: 28 });

    expect(segmentosRenderizados).toHaveLength(28);
    expect(segmentos.filter(({ cor }) => cor === CORES_DAS_FASES[fase])).toHaveLength(11);
    expect(segmentos.filter(({ cor }) => cor === COR_SEGMENTO_INATIVO)).toHaveLength(17);
});

test('limita o preenchimento à duração total do ciclo', () => {
    const segmentos = criarSegmentosDaMoldura({
        fase: 'lutea',
        diaCiclo: 35,
        duracaoCiclo: 28
    });

    expect(segmentos).toHaveLength(28);
    expect(segmentos.every(({ cor }) => cor === CORES_DAS_FASES.lutea)).toBe(true);
});

test('não apresenta uma arte incorreta quando a fase é desconhecida', async () => {
    await render(<CyclePhaseArtwork fase="desconhecida" diaCiclo={1} duracaoCiclo={28} />);

    expect(screen.queryByTestId('cycle-phase-artwork')).not.toBeOnTheScreen();
});
