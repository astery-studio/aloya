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
    expect(botao).toHaveStyle({ width: '100%', paddingTop: 8 });
    fireEvent.press(botao);
    expect(screen.getByLabelText('Data')).toBeTruthy();
});

test('data exibe borda laranja somente enquanto está focada', async () => {
    await render(<DateInput valor="08/04/1999" onChangeText={jest.fn()} />);
    const entrada = screen.getByLabelText('Data');
    const campo = screen.getByTestId('campo-data');
    await fireEvent(entrada, 'focus');
    expect(campo).toHaveStyle({
        borderColor: '#C85A44'
    });
    await fireEvent(entrada, 'blur');
    expect(campo).toHaveStyle({ borderColor: '#E6E2D8' });
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
/**
 * Testes de máscara, foco e remoção dos campos de data e horário.
 */
