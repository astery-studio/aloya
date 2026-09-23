/**
 * Testes da seleção contínua no calendário menstrual do onboarding.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import MenstruationCalendar from '../features/onboarding/components/MenstruationCalendar';

test('seleciona o fim do período depois do início', async () => {
    const aoAlterar = jest.fn();
    await render(<MenstruationCalendar
        valor={{ inicio: '2026-08-03', fim: null }} aoAlterar={aoAlterar} />);

    fireEvent.press(screen.getByLabelText('Selecionar dia 7'));

    expect(aoAlterar).toHaveBeenCalledWith({
        inicio: '2026-08-03', fim: '2026-08-07'
    });
});

test('marca todos os dias entre o início e o fim', async () => {
    await render(<MenstruationCalendar
        valor={{ inicio: '2026-08-03', fim: '2026-08-07' }} aoAlterar={jest.fn()} />);

    for (const dia of [3, 4, 5, 6, 7]) {
        expect(screen.getByLabelText(`Selecionar dia ${dia}`).props.accessibilityState)
            .toEqual({ selected: true, disabled: false });
    }
});

test('reinicia a seleção depois de completar um período', async () => {
    const aoAlterar = jest.fn();
    await render(<MenstruationCalendar
        valor={{ inicio: '2026-08-03', fim: '2026-08-07' }} aoAlterar={aoAlterar} />);

    fireEvent.press(screen.getByLabelText('Selecionar dia 10'));

    expect(aoAlterar).toHaveBeenCalledWith({ inicio: '2026-08-10', fim: null });
});

test('ordena o período quando o segundo dia é anterior ao primeiro', async () => {
    const aoAlterar = jest.fn();
    await render(<MenstruationCalendar
        valor={{ inicio: '2026-08-07', fim: null }} aoAlterar={aoAlterar} />);

    fireEvent.press(screen.getByLabelText('Selecionar dia 3'));

    expect(aoAlterar).toHaveBeenCalledWith({
        inicio: '2026-08-03', fim: '2026-08-07'
    });
});

test('permite navegar para o mês anterior', async () => {
    await render(<MenstruationCalendar
        valor={{ inicio: '2026-08-03', fim: null }} aoAlterar={jest.fn()} />);

    await fireEvent.press(screen.getByLabelText('Mês anterior'));

    expect(screen.getByLabelText('Julho de 2026')).toBeTruthy();
});

test('abre a lista e permite escolher outro mês', async () => {
    await render(<MenstruationCalendar
        valor={{ inicio: '2026-08-03', fim: null }} aoAlterar={jest.fn()} />);

    await fireEvent.press(screen.getByLabelText('Escolher mês'));
    expect(screen.getByLabelText('Selecionar Agosto de 2026').props.accessibilityState)
        .toEqual({ selected: true });
    await fireEvent.press(screen.getByLabelText('Selecionar Junho de 2026'));
    expect(screen.getByLabelText('Junho de 2026')).toBeTruthy();
});
