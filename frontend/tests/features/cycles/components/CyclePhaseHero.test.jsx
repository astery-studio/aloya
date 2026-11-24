import { screen } from '@testing-library/react-native';
import { CyclePhaseHero } from '../../../../src/features/cycles/components/home/CyclePhaseHero';
import { estilos as estilosFerteis } from '../../../../src/features/cycles/components/home/FertileHighlight.styles';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('comunica fase, dia e janela fértil por texto', async () => {
    await render(<CyclePhaseHero fase="ovulatoria" diaCiclo={14} janelaFertilAtiva />);

    expect(screen.getByRole('header', { name: 'Fase Ovulatória' })).toBeOnTheScreen();
    expect(screen.getByText('Dia 14 do ciclo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Janela fértil ativa')).toBeOnTheScreen();
    expect(screen.getByLabelText('Janela fértil ativa')).toHaveStyle({
        width: '100%',
        height: 67.67,
        borderWidth: 1.33333,
        borderColor: '#4A758E',
        borderStyle: 'dashed',
        borderRadius: 16
    });
    expect(estilosFerteis.margem).toMatchObject({ width: 358, height: 87.67, paddingTop: 20 });
});
