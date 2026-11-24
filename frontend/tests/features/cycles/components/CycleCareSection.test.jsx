import { fireEvent, screen } from '@testing-library/react-native';
import { CycleCareSection } from '../../../../src/features/cycles/components/home/CycleCareSection';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('oferece três cuidados com destinos independentes', async () => {
    const callbacks = [jest.fn(), jest.fn(), jest.fn()];
    await render(
        <CycleCareSection
            fase="lutea"
            corDestaque="#D68C3A"
            aoAbrirRespiracao={callbacks[0]}
            aoAbrirReflexao={callbacks[1]}
            aoAbrirEducacao={callbacks[2]}
        />
    );

    const cards = screen.getAllByRole('button');
    expect(screen.getByText('Para o seu momento')).toHaveStyle({ color: '#D68C3A' });
    expect(cards).toHaveLength(3);
    expect(screen.getByTestId('phosphor-react-native-wind-regular')).toBeOnTheScreen();
    expect(screen.getByTestId('phosphor-react-native-question-regular')).toBeOnTheScreen();
    for (const card of cards) await fireEvent.press(card);
    callbacks.forEach((callback) => expect(callback).toHaveBeenCalledTimes(1));
});

test.each([
    ['menstrual', 'phosphor-react-native-drop-fill'],
    ['folicular', 'phosphor-react-native-plant-regular'],
    ['ovulatoria', 'phosphor-react-native-sun-regular'],
    ['lutea', 'phosphor-react-native-waves-regular']
])('usa o ícone da fase %s no card educativo', async (fase, testID) => {
    await render(<CycleCareSection fase={fase} />);

    expect(screen.getByTestId(testID)).toBeOnTheScreen();
});
