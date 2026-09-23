import { fireEvent, render, screen } from '@testing-library/react-native';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

jest.mock('../services/auth/tokenStorage', () => ({ salvarToken: jest.fn() }));

test('cadastro explica quando o nome tem menos de três caracteres', async () => {
    const cadastrar = jest.fn();
    await render(<OnboardingScreen cadastrar={cadastrar} />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Al');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'al@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo');
    await fireEvent.press(screen.getByRole('checkbox'));

    const avancar = screen.getByRole('button', { name: 'Avançar' });
    expect(avancar).not.toBeDisabled();
    await fireEvent.press(avancar);

    expect(screen.getByText('Nome inválido')).toBeTruthy();
    expect(screen.getByText('O nome deve ter pelo menos 3 caracteres.')).toBeTruthy();
    expect(cadastrar).not.toHaveBeenCalled();
});
