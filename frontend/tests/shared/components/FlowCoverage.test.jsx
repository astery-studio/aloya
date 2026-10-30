import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AccountStep from '../../../src/features/onboarding/components/AccountStep/AccountStep';
import OnboardingStep from '../../../src/features/onboarding/components/OnboardingStep/OnboardingStep';
import { SelectionSheet } from '../../../src/shared/components/feedback/SelectionSheet/SelectionSheet';

test('etapa compartilhada permite pular e usa valores padrão', async () => {
    const aoPular = jest.fn();
    await render(
        <OnboardingStep
            etapa={1}
            titulo="Etapa"
            descricao="Descrição"
            aoVoltar={jest.fn()}
            aoPular={aoPular}
            aoAvancar={jest.fn()}
        >
            <Text>Conteúdo</Text>
        </OnboardingStep>
    );
    await fireEvent.press(screen.getByText('Pular'));
    expect(aoPular).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeEnabled();
});

test('conta aceita ausência do mapa de erros', async () => {
    await render(
        <AccountStep
            dados={{ nome: '', email: '', senha: '', confirmacao: '', aceitouTermos: false }}
            aoAlterar={jest.fn()}
            aoVoltar={jest.fn()}
            aoAvancar={jest.fn()}
        />
    );
    expect(screen.queryByRole('alert')).toBeNull();
});

test('seletor usa lista vazia por padrão', async () => {
    await render(
        <SafeAreaProvider
            initialMetrics={{
                frame: { x: 0, y: 0, width: 390, height: 844 },
                insets: { top: 0, right: 0, bottom: 32, left: 0 }
            }}
        >
            <SelectionSheet visivel titulo="Opções" />
        </SafeAreaProvider>
    );
    expect(screen.getByText('Nenhuma opção disponível.')).toBeTruthy();
});
