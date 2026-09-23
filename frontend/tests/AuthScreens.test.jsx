import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

jest.mock('../services/auth/tokenStorage', () => ({ salvarToken: jest.fn() }));

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
