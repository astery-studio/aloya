/**
 * Testes integrados das telas e interações do fluxo de autenticação.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '../../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../../screens/auth/LoginScreen';
import ResetPasswordScreen from '../../screens/auth/ResetPasswordScreen';

jest.mock('../../services/auth/tokenStorage', () => ({ salvarToken: jest.fn() }));

test('login inicia desativado e envia as credenciais preenchidas', async () => {
    const realizarLogin = jest.fn().mockResolvedValue({
        autenticacao: { token: 'jwt', tipo: 'Bearer' }
    });
    await render(<LoginScreen realizarLogin={realizarLogin} />);
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('Email'), 'pessoa@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(realizarLogin).toHaveBeenCalledWith({
        email: 'pessoa@email.com', senha: 'segredo'
    }));
});

test('tentar novamente fecha o erro sem repetir as credenciais', async () => {
    const realizarLogin = jest.fn().mockRejectedValue(new Error('Credenciais inválidas.'));
    await render(<LoginScreen realizarLogin={realizarLogin} />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'pessoa@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'incorreta');
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findByText('Não foi possível entrar');
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(realizarLogin).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Não foi possível entrar')).toBeNull();
    expect(screen.getByLabelText('Email').props.value).toBe('pessoa@email.com');
});

test('recuperação só permite envio com e-mail válido', async () => {
    const solicitarRecuperacao = jest.fn().mockResolvedValue({ mensagem: 'ok' });
    await render(<ForgotPasswordScreen solicitarRecuperacao={solicitarRecuperacao} />);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('Email'), 'pessoa@email.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => expect(solicitarRecuperacao).toHaveBeenCalledWith({
        email: 'pessoa@email.com'
    }));
});

test('recuperação explica o formato inválido sem enviar', async () => {
    const solicitarRecuperacao = jest.fn();
    await render(<ForgotPasswordScreen solicitarRecuperacao={solicitarRecuperacao} />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'email-invalido');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar' }));
    expect(screen.getByText('E-mail inválido')).toBeTruthy();
    expect(solicitarRecuperacao).not.toHaveBeenCalled();
});

test('redefinição exige senhas iguais antes de confirmar', async () => {
    const redefinirSenha = jest.fn().mockResolvedValue({ mensagem: 'ok' });
    await render(<ResetPasswordScreen token="token" redefinirSenha={redefinirSenha} />);
    await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'nova-senha');
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), 'nova-senha');
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(redefinirSenha).toHaveBeenCalledWith({
        token: 'token', senha: 'nova-senha'
    }));
});
