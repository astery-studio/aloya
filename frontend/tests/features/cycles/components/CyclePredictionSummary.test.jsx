import { fireEvent, screen } from '@testing-library/react-native';
import { CyclePredictionSummary } from '../../../../src/features/cycles/components/home/CyclePredictionSummary';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('apresenta previsão e abre a explicação de confiabilidade', async () => {
    const aoAbrir = jest.fn();
    await render(
        <CyclePredictionSummary
            proximoInicio="2026-11-28"
            ovulacaoEstimada="2026-11-14"
            janelaFertil={{ inicio: '2026-11-10', fim: '2026-11-15' }}
            confiabilidade="media"
            estimativaIncerta
            aoAbrirConfiabilidade={aoAbrir}
            corDestaque="#2C4C3B"
        />
    );

    expect(screen.getByText('Estimativa incerta')).toBeOnTheScreen();
    expect(screen.getByText('Previsão')).toHaveStyle({ color: '#2C4C3B' });
    expect(screen.getByText('10–15 de novembro')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Confiança média' }));
    expect(aoAbrir).toHaveBeenCalledTimes(1);
});
