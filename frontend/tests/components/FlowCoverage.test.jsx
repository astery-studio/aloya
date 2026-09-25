import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import AccountStep from '../../features/onboarding/AccountStep/AccountStep';
import OnboardingStep from '../../features/onboarding/OnboardingStep/OnboardingStep';
import { SelectionSheet } from '../../components/feedback/SelectionSheet/SelectionSheet';

test('etapa compartilhada permite pular e usa valores padrão', async () => {
    const aoPular = jest.fn();
    await render(<OnboardingStep etapa={1} titulo="Etapa" descricao="Descrição"
        aoVoltar={jest.fn()} aoPular={aoPular} aoAvancar={jest.fn()}>
        <Text>Conteúdo</Text>
    </OnboardingStep>);
    await fireEvent.press(screen.getByText('Pular'));
    expect(aoPular).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeEnabled();
});

test('conta aceita ausência do mapa de erros', async () => {
    await render(<AccountStep dados={{ nome: '', email: '', senha: '',
        confirmacao: '', aceitouTermos: false }} aoAlterar={jest.fn()}
        aoVoltar={jest.fn()} aoAvancar={jest.fn()} />);
    expect(screen.queryByRole('alert')).toBeNull();
});

test('seletor usa lista vazia por padrão', async () => {
    await render(<SelectionSheet visivel titulo="Opções" />);
    expect(screen.getByText('Nenhuma opção disponível.')).toBeTruthy();
});
