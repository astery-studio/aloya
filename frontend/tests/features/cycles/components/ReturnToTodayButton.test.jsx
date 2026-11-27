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
        minHeight: 34,
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 13,
        gap: 5,
        borderRadius: 999,
        backgroundColor: '#D68C3A',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 5
    });
    expect(botao).not.toHaveStyle({ borderWidth: 1 });
    expect(screen.queryByTestId('phosphor-react-native-rewind-regular')).not.toBeOnTheScreen();
    expect(screen.getByText('Voltar para:')).toHaveStyle({
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '300',
        lineHeight: 20
    });
    expect(screen.getByText('Hoje')).toHaveStyle({
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 20
    });
    await fireEvent.press(botao);

    expect(onPress).toHaveBeenCalledTimes(1);
});
