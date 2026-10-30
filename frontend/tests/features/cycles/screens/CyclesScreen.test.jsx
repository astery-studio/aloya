import { screen } from '@testing-library/react-native';

import { CyclesScreen } from '../../../../src/features/cycles/screens/CyclesScreen';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

test('apresenta a vitrine de ciclos com contraste do tema escuro', async () => {
    await renderWithTheme(<CyclesScreen />, { preferencia: 'escuro' });

    expect(screen.getByText('Teste do histórico de ciclos')).toHaveStyle({
        color: '#F4F1EA'
    });
    expect(screen.getByText('Ciclos registrados')).toBeOnTheScreen();
    expect(screen.getAllByTestId('cycle-history-card')).toHaveLength(5);
});
