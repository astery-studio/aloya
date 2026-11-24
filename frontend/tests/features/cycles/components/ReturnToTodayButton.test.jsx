import { fireEvent, screen } from '@testing-library/react-native';
import { ReturnToTodayButton } from '../../../../src/features/cycles/components/ReturnToTodayButton';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('retorna para a data de referência pela ação acessível', async () => {
    const onPress = jest.fn();
    await render(<ReturnToTodayButton onPress={onPress} />);

    const botao = screen.getByRole('button', { name: 'Voltar pra hoje' });
    expect(screen.getByTestId('faixa-voltar-hoje')).toHaveStyle({
        width: '100%',
        height: 38,
        paddingVertical: 2,
        paddingHorizontal: 16
    });
    expect(botao).toHaveStyle({
        width: 135,
        height: 34,
        alignSelf: 'flex-start',
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
