import { fireEvent, screen, within } from '@testing-library/react-native';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { WavesIcon } from 'phosphor-react-native/src/icons/Waves';
import { CycleEducationSection } from '../../../../src/features/cycles/components/CycleEducationSection';
import { DropIcon, SunIcon } from '../../../../src/shared/components/icons/AppIcons';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('alterna o conteúdo educativo das quatro fases', async () => {
    await render(<CycleEducationSection />);
    expect(screen.getByText(/revestimento interno/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Ovulatória' }));

    expect(screen.getByText(/fertilidade estimada/)).toBeOnTheScreen();
    expect(screen.getByText(/não possuem duração fixa/)).toBeOnTheScreen();
});

test.each([
    ['menstrual', DropIcon, 'fill', '#C85A44'],
    ['folicular', PlantIcon, 'regular', '#2C4C3B'],
    ['ovulatoria', SunIcon, 'regular', '#4A758E'],
    ['lutea', WavesIcon, 'regular', '#D68C3A']
])('usa o ícone do protótipo sem caixa colorida na fase %s', async (fase, Icone, weight, color) => {
    await render(<CycleEducationSection />);
    const icone = screen.getByTestId(`icone-fase-educativa-${fase}`);
    expect(icone).not.toHaveStyle({ backgroundColor: expect.any(String) });
    expect(within(icone).UNSAFE_getByType(Icone).props).toMatchObject({ weight, color, size: 24 });
});
