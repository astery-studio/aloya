import { fireEvent, render, screen } from '@testing-library/react-native';
import Button from '../components/common/Button/Button';
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

test('cadastro envia a duração lútea como número, sem o evento do botão', async () => {
    const cadastrar = jest.fn().mockResolvedValue({
        autenticacao: { token: 'jwt', tipo: 'Bearer' }
    });
    const seletor = () => null;
    const calendario = ({ aoAlterar }) => <Button texto="Selecionar período"
        aoPressionar={() => aoAlterar({ inicio: '2026-08-03', fim: '2026-08-07' })} />;
    await render(<OnboardingScreen cadastrar={cadastrar}
        renderizarCalendario={calendario} renderizarSeletorCiclo={seletor}
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
