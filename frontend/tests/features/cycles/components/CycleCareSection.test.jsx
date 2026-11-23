import { fireEvent, screen } from '@testing-library/react-native';
import { CycleCareSection } from '../../../../src/features/cycles/components/home/CycleCareSection';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('oferece três cuidados com destinos independentes', async () => {
    const callbacks = [jest.fn(), jest.fn(), jest.fn()];
    await render(
        <CycleCareSection
            fase="lutea"
            aoAbrirRespiracao={callbacks[0]}
            aoAbrirReflexao={callbacks[1]}
            aoAbrirEducacao={callbacks[2]}
        />
    );

    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(3);
    for (const card of cards) await fireEvent.press(card);
    callbacks.forEach((callback) => expect(callback).toHaveBeenCalledTimes(1));
});
