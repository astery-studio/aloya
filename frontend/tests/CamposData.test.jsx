import { fireEvent, render, screen } from '@testing-library/react-native';
import DateInput from '../components/forms/DateInput';
import TimeInput from '../components/forms/TimeInput';

test('data formata oito dígitos como DD/MM/AAAA', async () => {
    const aoMudar = jest.fn();
    await render(<DateInput valor="" onChangeText={aoMudar} />);
    fireEvent.changeText(screen.getByLabelText('Data'), '08041999');
    expect(aoMudar).toHaveBeenCalledWith('08/04/1999');
});

test('ícone de data foca o campo quando não há calendário', async () => {
    await render(<DateInput valor="" onChangeText={jest.fn()} />);
    const botao = screen.getByRole('button', { name: 'Digitar data' });
    expect(botao.props.hitSlop).toBe(12);
    fireEvent.press(botao);
    expect(screen.getByLabelText('Data')).toBeTruthy();
});

test('horário formata quatro dígitos como HH:MM', async () => {
    const aoMudar = jest.fn();
    await render(<TimeInput valor="" onChangeText={aoMudar} />);
    fireEvent.changeText(screen.getByLabelText('Horário'), '2030');
    expect(aoMudar).toHaveBeenCalledWith('20:30');
});

test('horário removível chama a ação de remoção', async () => {
    const aoRemover = jest.fn();
    await render(<TimeInput valor="08:00" podeRemover aoRemover={aoRemover} />);
    fireEvent.press(screen.getByRole('button', { name: 'Remover horário 08:00' }));
    expect(aoRemover).toHaveBeenCalledTimes(1);
});
