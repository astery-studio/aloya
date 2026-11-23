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

test('respeita estado controlado e delega a alternância', async () => {
    const aoAlternar = jest.fn();
    await render(
        <CycleExpandableCard titulo="Ritmo do ciclo" expandido={false} aoAlternar={aoAlternar}>
            <Text>Conteúdo controlado</Text>
        </CycleExpandableCard>
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Ritmo do ciclo' }));
    expect(aoAlternar).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Conteúdo controlado')).not.toBeOnTheScreen();
});
