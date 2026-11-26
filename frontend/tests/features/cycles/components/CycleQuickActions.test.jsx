import { screen } from '@testing-library/react-native';
import { CycleQuickActions } from '../../../../src/features/cycles/components/home/CycleQuickActions';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('usa gota preenchida somente no cadastro menstrual', async () => {
    await render(
        <CycleQuickActions
            aoCadastrarMenstruacao={jest.fn()}
            aoAbrirDiario={jest.fn()}
            aoAbrirAnticoncepcional={jest.fn()}
        />
    );

    expect(screen.getByTestId('phosphor-react-native-drop-fill')).toBeOnTheScreen();
});
