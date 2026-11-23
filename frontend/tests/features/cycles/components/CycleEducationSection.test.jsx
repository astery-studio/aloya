import { fireEvent, screen } from '@testing-library/react-native';
import { CycleEducationSection } from '../../../../src/features/cycles/components/CycleEducationSection';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('alterna o conteúdo educativo das quatro fases', async () => {
    await render(<CycleEducationSection />);
    expect(screen.getByText(/ciclo recomeça/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Ovulatória' }));

    expect(screen.getByText(/fertilidade estimada/)).toBeOnTheScreen();
    expect(screen.getByText(/não substituem orientação médica/)).toBeOnTheScreen();
});
