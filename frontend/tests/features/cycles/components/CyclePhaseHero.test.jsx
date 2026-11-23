import { screen } from '@testing-library/react-native';
import { CyclePhaseHero } from '../../../../src/features/cycles/components/home/CyclePhaseHero';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('comunica fase, dia e janela fértil por texto', async () => {
    await render(<CyclePhaseHero fase="ovulatoria" diaCiclo={14} janelaFertilAtiva />);

    expect(screen.getByRole('header', { name: 'Fase Ovulatória' })).toBeOnTheScreen();
    expect(screen.getByText('Dia 14 do ciclo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Janela fértil ativa')).toBeOnTheScreen();
});
