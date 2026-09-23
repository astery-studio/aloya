/**
 * Testes das validações e transições executadas durante o onboarding.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

jest.mock('../services/auth/tokenStorage', () => ({ salvarToken: jest.fn() }));
jest.mock('../features/onboarding/components/MenstruationCalendar', () => {
    const { Pressable, Text } = require('react-native');
    return { __esModule: true, default: ({ aoAlterar }) => (
        <Pressable accessibilityRole="button" accessibilityLabel="Selecionar período"
            onPress={() => aoAlterar({ inicio: '2026-08-03', fim: '2026-08-07' })}>
            <Text>Calendário menstrual</Text>
        </Pressable>
    ) };
});

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

test('cadastro não avança quando o e-mail já existe', async () => {
    const verificarEmailDisponivel = jest.fn().mockResolvedValue({ disponivel: false });
    await render(<OnboardingScreen cadastrar={jest.fn()}
        verificarEmailDisponivel={verificarEmailDisponivel} />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'carla@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo');
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    expect(await screen.findByText('E-mail já cadastrado')).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
});

test('cadastro envia a duração lútea como número, sem o evento do botão', async () => {
    const cadastrar = jest.fn().mockResolvedValue({
        autenticacao: { token: 'jwt', tipo: 'Bearer' }
    });
    const seletor = () => null;
    await render(<OnboardingScreen cadastrar={cadastrar}
        renderizarSeletorCiclo={seletor}
        renderizarSeletorMenstruacao={seletor} renderizarSeletorLutea={seletor} />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'carla@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo');
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012000');
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar período' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    expect(cadastrar).toHaveBeenCalledWith(expect.objectContaining({
        duracaoLuteaInformada: 14
    }));
    expect(() => JSON.stringify(cadastrar.mock.calls[0][0])).not.toThrow();
});
