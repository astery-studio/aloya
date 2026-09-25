/**
 * Testes de apresentação e interação dos componentes do onboarding.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import BirthDateStep from '../../features/onboarding/components/BirthDateStep';
import CycleLengthStep from '../../features/onboarding/components/CycleLengthStep';
import LastMenstruationStep from '../../features/onboarding/components/LastMenstruationStep';
import OnboardingProgress from '../../features/onboarding/components/OnboardingProgress';

test('progresso calcula a largura pela etapa atual', async () => {
    await render(<OnboardingProgress etapaAtual={3} totalEtapas={5} />);
    const barra = screen.getByLabelText('Etapa 3 de 5');
    expect(barra).toHaveAccessibilityValue({ min: 0, max: 5, now: 3 });
    expect(screen.getByTestId('progresso-preenchido')).toHaveStyle({ width: '60%' });
});

test('nascimento habilita avanço apenas com data válida', async () => {
    const aoAvancar = jest.fn();
    const { rerender } = await render(<BirthDateStep valor=""
        aoAlterar={jest.fn()} aoVoltar={jest.fn()} aoAvancar={aoAvancar} />);
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeDisabled();
    await rerender(<BirthDateStep valor="04/01/2000"
        aoAlterar={jest.fn()} aoVoltar={jest.fn()} aoAvancar={aoAvancar} />);
    fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    expect(aoAvancar).toHaveBeenCalledTimes(1);
});

test('duração delega o campo ao SelectInput externo', async () => {
    const renderizarSeletor = jest.fn(({ valor }) => <Text>{valor} dias</Text>);
    await render(<CycleLengthStep valor={28} aoAlterar={jest.fn()}
        aoVoltar={jest.fn()} aoAvancar={jest.fn()} aoPular={jest.fn()}
        renderizarSeletor={renderizarSeletor} />);
    expect(screen.getByText('28 dias')).toBeTruthy();
    expect(renderizarSeletor).toHaveBeenCalledWith(expect.objectContaining({ valor: 28 }));
});

test('última menstruação delega a interface ao calendário externo', async () => {
    const periodo = { inicio: '2026-08-03', fim: '2026-08-07' };
    const renderizarCalendario = jest.fn(() => <Text>Calendário externo</Text>);
    await render(<LastMenstruationStep valor={periodo} aoAlterar={jest.fn()}
        aoVoltar={jest.fn()} aoAvancar={jest.fn()}
        renderizarCalendario={renderizarCalendario} />);
    expect(screen.getByText('Calendário externo')).toBeTruthy();
    expect(renderizarCalendario).toHaveBeenCalledWith(expect.objectContaining({ valor: periodo }));
});
