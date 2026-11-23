import { fireEvent, screen } from '@testing-library/react-native';
import { ReturnToTodayButton } from '../../../../src/features/cycles/components/ReturnToTodayButton';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('retorna para a data de referência pela ação acessível', async () => {
    const onPress = jest.fn();
    await render(<ReturnToTodayButton onPress={onPress} />);

    const botao = screen.getByRole('button', { name: 'Voltar para hoje' });
    await fireEvent.press(botao);

    expect(onPress).toHaveBeenCalledTimes(1);
});
