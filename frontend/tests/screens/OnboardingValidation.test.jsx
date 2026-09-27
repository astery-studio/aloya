/**
 * Testes das validações e transições executadas durante o onboarding.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import OnboardingScreen from '../../screens/onboarding/OnboardingScreen';

jest.mock('../../services/auth/tokenStorage', () => ({ salvarToken: jest.fn() }));
jest.mock('../../features/onboarding/MenstruationCalendar/MenstruationCalendar', () => {
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
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('checkbox'));

    const avancar = screen.getByRole('button', { name: 'Avançar' });
    expect(avancar).not.toBeDisabled();
    await fireEvent.press(avancar);

    expect(screen.getByText('Nome inválido')).toBeTruthy();
    expect(screen.getAllByText(
        'O nome deve ter pelo menos 3 caracteres.'
    )).toHaveLength(2);
    expect(cadastrar).not.toHaveBeenCalled();
});

test('cadastro não avança quando o e-mail já existe', async () => {
    const verificarEmailDisponivel = jest.fn().mockResolvedValue({ disponivel: false });
    await render(<OnboardingScreen cadastrar={jest.fn()}
        verificarEmailDisponivel={verificarEmailDisponivel} />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'carla@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo1');
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
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo1');
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

test('cadastro rejeita senha curta junto ao campo', async () => {
    await render(<OnboardingScreen cadastrar={jest.fn()} />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'carla@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'curta');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'curta');
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    expect(screen.getAllByText(
        'A senha deve possuir pelo menos 8 caracteres.'
    ).length).toBeGreaterThanOrEqual(1);
});

test('nome remove números e caracteres especiais durante a digitação', async () => {
    await render(<OnboardingScreen cadastrar={jest.fn()} />);

    const nome = screen.getByLabelText('Nome');
    await fireEvent.changeText(nome, 'Carla 123! Cristina');

    expect(nome.props.value).toBe('Carla Cristina');
});
