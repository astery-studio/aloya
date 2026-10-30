import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import MenstruationCalendar from '../../../src/features/onboarding/components/MenstruationCalendar/MenstruationCalendar';
import OnboardingProgress from '../../../src/features/onboarding/components/OnboardingProgress/OnboardingProgress';
import OnboardingStep from '../../../src/features/onboarding/components/OnboardingStep/OnboardingStep';
import { renderWithTheme } from '../../helpers/renderWithTheme';

describe.each([
    ['claro', '#222222', '#E6E2D8', '#2C4C3B'],
    ['escuro', '#F4F1EA', '#4A514D', '#9FD6B6']
])('onboarding no tema %s', (preferencia, textoPrincipal, borda, destaque) => {
    test('aplica a paleta ativa à estrutura e ao progresso', async () => {
        await renderWithTheme(
            <OnboardingStep
                etapa={2}
                titulo="Dados do ciclo"
                descricao="Conteúdo adaptado ao tema."
                aoVoltar={jest.fn()}
                aoAvancar={jest.fn()}
            >
                <Text>Campo</Text>
            </OnboardingStep>,
            { preferencia }
        );

        expect(screen.getByText('Dados do ciclo')).toHaveStyle({
            color: textoPrincipal
        });
        expect(screen.getByTestId('progresso-preenchido')).toHaveStyle({
            backgroundColor: destaque
        });
    });

    test('aplica a paleta ativa ao calendário menstrual', async () => {
        const { toJSON } = await renderWithTheme(
            <MenstruationCalendar
                valor={{ inicio: '2026-08-03', fim: '2026-08-07' }}
                aoAlterar={jest.fn()}
            />,
            { preferencia }
        );

        expect(screen.getByLabelText('Agosto de 2026')).toHaveStyle({
            color: textoPrincipal
        });
        expect(screen.getByLabelText('Selecionar dia 3')).toHaveStyle({
            backgroundColor: destaque
        });
        expect(screen.getByText('Dom')).toHaveStyle({
            color: preferencia === 'escuro' ? '#C4C8C5' : '#5C5C59'
        });
        expect(JSON.stringify(toJSON())).toContain(borda);
    });
});

test('progresso usa a borda escura como trilha', async () => {
    const { toJSON } = await renderWithTheme(
        <OnboardingProgress etapaAtual={1} totalEtapas={5} />,
        { preferencia: 'escuro' }
    );

    expect(JSON.stringify(toJSON())).toContain('#4A514D');
});
