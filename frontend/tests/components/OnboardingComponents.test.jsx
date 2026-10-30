/**
 * Testes de apresentação e interação dos componentes do onboarding.
 */
import { fireEvent, screen, within } from '@testing-library/react-native';
import BirthDateStep from '../../src/features/onboarding/components/BirthDateStep/BirthDateStep';
import CycleLengthStep from '../../src/features/onboarding/components/CycleLengthStep/CycleLengthStep';
import LastMenstruationStep from '../../src/features/onboarding/components/LastMenstruationStep/LastMenstruationStep';
import OnboardingProgress from '../../src/features/onboarding/components/OnboardingProgress/OnboardingProgress';
import { renderWithTheme } from '../helpers/renderWithTheme';

test('progresso calcula a largura pela etapa atual', async () => {
    await renderWithTheme(<OnboardingProgress etapaAtual={3} totalEtapas={5} />);
    const barra = screen.getByLabelText('Etapa 3 de 5');
    expect(barra).toHaveAccessibilityValue({ min: 0, max: 5, now: 3 });
    expect(screen.getByTestId('progresso-preenchido')).toHaveStyle({ width: '60%' });
});

test.each([
    [-1, 5, 'Etapa 0 de 5', '0%'],
    [8, 5, 'Etapa 5 de 5', '100%'],
    [1, 0, 'Etapa 0 de 0', '0%']
])('progresso limita valores fora da faixa', async (etapaAtual, totalEtapas, rotulo, largura) => {
    await renderWithTheme(<OnboardingProgress etapaAtual={etapaAtual} totalEtapas={totalEtapas} />);
    expect(screen.getByLabelText(rotulo)).toBeTruthy();
    expect(screen.getByTestId('progresso-preenchido')).toHaveStyle({ width: largura });
});

test('nascimento habilita avanço apenas com data válida', async () => {
    const aoAvancar = jest.fn();
    const { rerender } = await renderWithTheme(
        <BirthDateStep valor="" aoAlterar={jest.fn()} aoVoltar={jest.fn()} aoAvancar={aoAvancar} />
    );
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeDisabled();
    await rerender(
        <BirthDateStep
            valor="04/01/2000"
            aoAlterar={jest.fn()}
            aoVoltar={jest.fn()}
            aoAvancar={aoAvancar}
        />
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    expect(aoAvancar).toHaveBeenCalledTimes(1);
});

test('nascimento oferece e-mail opcional para menor de 16 anos', async () => {
    const aoAlterarEmailResponsavel = jest.fn();
    await renderWithTheme(
        <BirthDateStep
            valor="04/01/2012"
            menorDe16
            emailResponsavelLegal="responsavel@email.com"
            erroEmailResponsavel="E-mail inválido"
            aoAlterarEmailResponsavel={aoAlterarEmailResponsavel}
            aoAlterar={jest.fn()}
            aoVoltar={jest.fn()}
            aoAvancar={jest.fn()}
        />
    );

    const email = screen.getByLabelText('E-mail do responsável legal (opcional)');
    await fireEvent.changeText(email, 'novo@email.com');
    expect(aoAlterarEmailResponsavel).toHaveBeenCalledWith('novo@email.com');
    expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido');
});

test('duração permite digitar o número sem alterar a unidade', async () => {
    const aoAlterar = jest.fn();
    await renderWithTheme(<CycleLengthStep
        valor={28} aoAlterar={aoAlterar}
        aoVoltar={jest.fn()} aoAvancar={jest.fn()} aoPular={jest.fn()} />);
    expect(screen.getByText('dias')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Não sei' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeEnabled();
    await fireEvent.changeText(screen.getByLabelText('Duração em dias'), '30');
    expect(aoAlterar).toHaveBeenCalledWith(30);
    expect(screen.queryByRole('button', { name: 'Não sei' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeEnabled();
});

test('última menstruação seleciona o intervalo no calendário próprio', async () => {
    const aoAlterar = jest.fn();
    const aoNaoSei = jest.fn();
    const { rerender } = await renderWithTheme(<LastMenstruationStep
        valor={{ inicio: '2026-08-03', fim: null }} aoAlterar={aoAlterar}
        aoVoltar={jest.fn()} aoAvancar={jest.fn()} aoNaoSei={aoNaoSei} />);
    expect(screen.getByTestId('onboarding-step-fixed-texts')).toHaveStyle({
        marginTop: 32
    });
    expect(within(screen.getByTestId('form-layout-header')).getByTestId(
        'onboarding-step-fixed-texts'
    )).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Selecionar dia 7'));
    expect(aoAlterar).toHaveBeenCalledWith({
        inicio: '2026-08-03',
        fim: '2026-08-07'
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Não sei' }));
    expect(aoNaoSei).toHaveBeenCalledTimes(1);
    await rerender(<LastMenstruationStep valor={null} aoAlterar={jest.fn()}
        aoVoltar={jest.fn()} aoAvancar={jest.fn()} aoNaoSei={aoNaoSei} />);
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeDisabled();
});
