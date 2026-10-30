/**
 * Testes de máscara, foco e remoção dos campos de data e horário.
 */
import { fireEvent, screen } from '@testing-library/react-native';
import DateInput from '../../src/shared/components/forms/DateInput';
import TimeInput from '../../src/shared/components/forms/TimeInput';
import { renderWithTheme } from '../helpers/renderWithTheme';

test('data formata oito dígitos como DD/MM/AAAA', async () => {
    const aoMudar = jest.fn();
    await renderWithTheme(<DateInput valor="" onChangeText={aoMudar} />);
    fireEvent.changeText(screen.getByLabelText('Data'), '08041999');
    expect(aoMudar).toHaveBeenCalledWith('08/04/1999');
});

test('qualquer toque no campo de data abre o teclado para digitação', async () => {
    await renderWithTheme(<DateInput valor="" onChangeText={jest.fn()} />);
    const botao = screen.getByRole('button', { name: 'Digitar data' });
    expect(botao).toHaveStyle({ width: '100%', paddingTop: 8 });
    fireEvent.press(botao);
    expect(screen.getByLabelText('Data')).toBeTruthy();
});

test('data exibe borda laranja somente enquanto está focada', async () => {
    await renderWithTheme(<DateInput valor="08/04/1999" onChangeText={jest.fn()} />);
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
    await renderWithTheme(<TimeInput valor="" onChangeText={aoMudar} />);
    fireEvent.changeText(screen.getByLabelText('Horário'), '2030');
    expect(aoMudar).toHaveBeenCalledWith('20:30');
});

test('horário removível chama a ação de remoção', async () => {
    const aoRemover = jest.fn();
    await renderWithTheme(<TimeInput valor="08:00" podeRemover aoRemover={aoRemover} />);
    fireEvent.press(screen.getByRole('button', { name: 'Remover horário 08:00' }));
    expect(aoRemover).toHaveBeenCalledTimes(1);
});

test('data encaminha eventos opcionais de foco e saída', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await renderWithTheme(
        <DateInput valor="" onFocus={onFocus} onBlur={onBlur} rotuloAcessibilidade="Nascimento" />
    );
    const entrada = screen.getByLabelText('Nascimento');
    await fireEvent(entrada, 'focus');
    await fireEvent(entrada, 'blur');
    expect(entrada.props.editable).toBe(true);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
});

test('data desativada bloqueia a edição', async () => {
    await renderWithTheme(<DateInput desativado />);
    expect(screen.getByLabelText('Data').props.editable).toBe(false);
});

test('horário vazio e desativado mantém remoção bloqueada', async () => {
    await renderWithTheme(<TimeInput podeRemover desativado />);
    expect(screen.getByLabelText('Horário').props.editable).toBe(false);
    expect(screen.getByRole('button', { name: 'Remover horário' })).toBeDisabled();
});
