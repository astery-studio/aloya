import { screen } from '@testing-library/react-native';
import {
    CyclePhaseArtwork,
    IMAGENS_DAS_FASES
} from '../../../../src/features/cycles/components/home/CyclePhaseArtwork';
import {
    CONFIGURACAO_DA_MOLDURA,
    COR_SEGMENTO_INATIVO,
    obterCorDoSegmento,
    SEGMENTOS
} from '../../../../src/features/cycles/components/home/CyclePhaseFrame';
import { TAMANHO_ARTE } from '../../../../src/features/cycles/components/home/CyclePhaseArtwork.styles';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const FASES = ['menstrual', 'folicular', 'ovulatoria', 'lutea'];

test.each(FASES)('apresenta a imagem e a moldura da fase %s em 260 por 260', async (fase) => {
    await render(<CyclePhaseArtwork fase={fase} />);

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

test.each(FASES)('colore a progressão da moldura conforme a fase %s', async (fase) => {
    await render(<CyclePhaseArtwork fase={fase} />);

    const segmentos = screen.getAllByTestId('cycle-phase-frame-segment');
    const configuracao = CONFIGURACAO_DA_MOLDURA[fase];
    const cores = SEGMENTOS.map((_, indice) => obterCorDoSegmento(fase, indice));

    expect(segmentos).toHaveLength(SEGMENTOS.length);
    expect(cores.filter((cor) => cor === configuracao.cor)).toHaveLength(
        configuracao.segmentosAtivos
    );
    expect(cores.filter((cor) => cor === COR_SEGMENTO_INATIVO)).toHaveLength(
        SEGMENTOS.length - configuracao.segmentosAtivos
    );
});

test('não apresenta uma arte incorreta quando a fase é desconhecida', async () => {
    await render(<CyclePhaseArtwork fase="desconhecida" />);

    expect(screen.queryByTestId('cycle-phase-artwork')).not.toBeOnTheScreen();
});
