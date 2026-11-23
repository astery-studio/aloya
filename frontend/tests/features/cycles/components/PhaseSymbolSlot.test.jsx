import { screen } from '@testing-library/react-native';
import { PhaseSymbolSlot } from '../../../../src/features/cycles/components/PhaseSymbolSlot';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('reserva o espaço sem expor símbolo ou fallback', async () => {
    await render(<PhaseSymbolSlot />);

    expect(screen.getByTestId('phase-symbol-slot', { includeHiddenElements: true })).toHaveStyle({
        width: 260,
        height: 304,
        alignSelf: 'center'
    });
    expect(screen.queryByLabelText(/símbolo/i)).not.toBeOnTheScreen();
});

test('oferece uma reserva compacta para a apresentação sem ciclo', async () => {
    await render(<PhaseSymbolSlot compact />);
    expect(screen.getByTestId('phase-symbol-slot', { includeHiddenElements: true })).toHaveStyle({
        width: 128,
        height: 144
    });
});
