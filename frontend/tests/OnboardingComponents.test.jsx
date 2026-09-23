/**
 * Testes de apresentação e interação dos componentes do onboarding.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import BirthDateStep from '../features/onboarding/components/BirthDateStep';
import CycleLengthStep from '../features/onboarding/components/CycleLengthStep';
import LastMenstruationStep from '../features/onboarding/components/LastMenstruationStep';
import OnboardingProgress from '../features/onboarding/components/OnboardingProgress';

jest.mock('../components/feedback/SelectionSheet/SelectionSheet', () => {
    const { Pressable, Text } = require('react-native');
    return { SelectionSheet: ({ visivel, onSelecionar }) => visivel ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Selecionar 30 dias"
            onPress={() => onSelecionar(30)}>
            <Text>30 dias</Text>
        </Pressable>
    ) : null };
});

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

test('duração abre o seletor e atualiza o valor escolhido', async () => {
    const aoAlterar = jest.fn();
    await render(<CycleLengthStep valor={28} aoAlterar={aoAlterar}
        aoVoltar={jest.fn()} aoAvancar={jest.fn()} aoPular={jest.fn()} />);
    expect(screen.getByText('28 dias')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Selecionar duração em dias'));
    await fireEvent.press(screen.getByLabelText('Selecionar 30 dias'));
    expect(aoAlterar).toHaveBeenCalledWith(30);
});

test('última menstruação seleciona o intervalo no calendário próprio', async () => {
    const aoAlterar = jest.fn();
    await render(<LastMenstruationStep
        valor={{ inicio: '2026-08-03', fim: null }} aoAlterar={aoAlterar}
        aoVoltar={jest.fn()} aoAvancar={jest.fn()} />);
    fireEvent.press(screen.getByLabelText('Selecionar dia 7'));
    expect(aoAlterar).toHaveBeenCalledWith({
        inicio: '2026-08-03', fim: '2026-08-07'
    });
});
