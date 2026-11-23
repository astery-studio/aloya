import { fireEvent, screen } from '@testing-library/react-native';

import { FilterChip } from '../../../../src/shared/components/common/FilterChip/FilterChip';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('exibe o critério e permite removê-lo', async () => {
    const aoRemover = jest.fn();
    await render(<FilterChip rotulo="Fase Folicular" aoRemover={aoRemover} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Remover filtro Fase Folicular' }));

    expect(screen.getByText('Fase Folicular')).toBeOnTheScreen();
    expect(aoRemover).toHaveBeenCalledTimes(1);
});
