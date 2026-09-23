/**
 * Testes dos campos de texto, e-mail e senha e de suas interações.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import TextInput from '../components/forms/TextInput';
import EmailInput from '../components/forms/EmailInput';
import PasswordInput from '../components/forms/PasswordInput';

test('campo de texto entrega o valor digitado', async () => {
    const aoMudar = jest.fn();
    await render(<TextInput label="Nome" placeholder="Nome" value="" onChangeText={aoMudar} />);
    fireEvent.changeText(screen.getByLabelText('Nome'), 'Julia');
    expect(aoMudar).toHaveBeenCalledWith('Julia');
});

test('campo desativado não permite edição', async () => {
    await render(<TextInput label="Nome" value="Julia" desativado />);
    expect(screen.getByLabelText('Nome').props.editable).toBe(false);
});

test('e-mail remove espaços e caracteres de controle', async () => {
    const aoMudar = jest.fn();
    await render(<EmailInput value="" onChangeText={aoMudar} />);
    fireEvent.changeText(screen.getByLabelText('Email'), '  teste@exemplo.com\n ');
    expect(aoMudar).toHaveBeenCalledWith('teste@exemplo.com');
});

test('senha começa oculta e pode ser exibida', async () => {
    await render(<PasswordInput value="segredo" onChangeText={jest.fn()} />);
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));
    await waitFor(() => expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false));
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeTruthy();
});
