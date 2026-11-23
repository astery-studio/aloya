import { fireEvent, screen } from '@testing-library/react-native';
import { NoCycleTrackingSection } from '../../../../src/features/cycles/components/home/NoCycleTrackingSection';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('mantém expansões independentes e abre anticoncepcionais', async () => {
    const aoAlternar = jest.fn();
    const aoAbrir = jest.fn();
    await render(
        <NoCycleTrackingSection
            idsExpandidos={new Set(['anticoncepcional'])}
            aoAlternar={aoAlternar}
            aoAbrirAnticoncepcional={aoAbrir}
        />
    );

    expect(screen.getByText(/Organize seus registros/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: /Entenda o ritmo/ }));
    expect(aoAlternar).toHaveBeenCalledWith('ritmo');
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir Anticoncepcionais' }));
    expect(aoAbrir).toHaveBeenCalledTimes(1);
});
