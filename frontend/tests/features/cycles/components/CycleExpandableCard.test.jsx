import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { CycleExpandableCard } from '../../../../src/features/cycles/components/CycleExpandableCard';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('expande e recolhe o conteúdo de forma independente', async () => {
    await render(
        <CycleExpandableCard title="Entenda sua fase">
            <Text>Conteúdo educativo</Text>
        </CycleExpandableCard>
    );
    const trigger = screen.getByRole('button', { name: 'Entenda sua fase' });
    expect(trigger.props.accessibilityState.expanded).toBe(false);
    expect(screen.queryByText('Conteúdo educativo')).not.toBeOnTheScreen();

    await fireEvent.press(trigger);
    expect(screen.getByText('Conteúdo educativo')).toBeOnTheScreen();
    expect(trigger.props.accessibilityState.expanded).toBe(true);
});
