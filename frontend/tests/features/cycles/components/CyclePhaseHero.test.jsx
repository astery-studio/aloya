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
        minHeight: 67.67,
        borderWidth: 1.33333,
        borderColor: '#4A758E',
        borderStyle: 'dashed',
        borderRadius: 16
    });
    expect(estilosFerteis.margem).toMatchObject({ width: 358, minHeight: 87.67, paddingTop: 20 });
});

test('usa o verde da fase folicular e conserva o espaço vazio do símbolo', async () => {
    await render(<CyclePhaseHero fase="folicular" diaCiclo={8} janelaFertilAtiva />);

    expect(screen.getByLabelText('Janela fértil ativa')).toHaveStyle({ borderColor: '#2C4C3B' });
    expect(screen.getByTestId('phase-symbol-slot', { includeHiddenElements: true })).toHaveStyle({
        width: 260,
        height: 284
    });
});

test('mostra o título genérico quando a fase ainda não é conhecida', async () => {
    await render(<CyclePhaseHero fase="fase-nova" />);

    expect(screen.getByRole('header', { name: 'Seu ciclo' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('Janela fértil ativa')).not.toBeOnTheScreen();
    expect(screen.queryByText(/Dia .* do ciclo/)).not.toBeOnTheScreen();
});
