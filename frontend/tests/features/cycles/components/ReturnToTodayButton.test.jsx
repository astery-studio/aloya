import { fireEvent, screen } from '@testing-library/react-native';
import { ReturnToTodayButton } from '../../../../src/features/cycles/components/ReturnToTodayButton';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('retorna para a data de referência pela ação acessível', async () => {
    const onPress = jest.fn();
    await render(<ReturnToTodayButton onPress={onPress} />);

    const botao = screen.getByRole('button', { name: 'Voltar para hoje' });
    expect(screen.getByTestId('faixa-voltar-hoje')).toHaveStyle({
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6
    });
    expect(botao).toHaveStyle({
        height: 20,
        paddingVertical: 6,
        paddingHorizontal: 13,
        gap: 5,
        borderColor: 'rgba(214, 140, 58, 0.40)',
        borderStyle: 'dashed',
        borderRadius: 999
    });
    expect(screen.queryByTestId('phosphor-react-native-rewind-regular')).not.toBeOnTheScreen();
    expect(screen.getByText('Voltar para:')).toHaveStyle({
        color: 'rgba(214, 140, 58, 0.60)',
        fontSize: 10,
        fontWeight: '300',
        lineHeight: 19.5
    });
    expect(screen.getByText('Hoje')).toHaveStyle({
        color: 'rgba(214, 140, 58, 0.60)',
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 19.5
    });
    await fireEvent.press(botao);

    expect(onPress).toHaveBeenCalledTimes(1);
});
