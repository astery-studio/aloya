import { fireEvent, screen } from '@testing-library/react-native';
import { ReturnToTodayButton } from '../../../../src/features/cycles/components/ReturnToTodayButton';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('retorna para a data de referência pela ação acessível', async () => {
    const onPress = jest.fn();
    await render(<ReturnToTodayButton onPress={onPress} />);

    const botao = screen.getByRole('button', { name: 'Voltar pra hoje' });
    expect(botao).toHaveStyle({
        width: 135,
        height: 34,
        alignSelf: 'flex-start',
        marginLeft: 18,
        borderColor: '#AAAAA5',
        borderStyle: 'dashed',
        borderRadius: 999
    });
    expect(screen.getByTestId('phosphor-react-native-rewind-regular')).toBeOnTheScreen();
    expect(screen.getByText('Voltar pra hoje')).toHaveStyle({
        color: '#5C5C59',
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 20
    });
    await fireEvent.press(botao);

    expect(onPress).toHaveBeenCalledTimes(1);
});
