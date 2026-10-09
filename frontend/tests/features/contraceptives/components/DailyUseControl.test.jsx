import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { DailyUseControl } from '../../../../src/features/contraceptives/components/DailyUseControl';

jest.mock('phosphor-react-native', () => {
    const { Text } = require('react-native');
    return new Proxy({}, { get: (_, nome) => (props) => <Text {...props}>{String(nome)}</Text> });
});

test('confirma e desmarca um uso de forma otimista', async () => {
    const aoAlternar = jest.fn().mockResolvedValue(undefined);
    await render(<DailyUseControl uso={{ id: 'u1', horario: '08:00', status: 'pendente' }} aoAlternar={aoAlternar} />);

    await fireEvent.press(screen.getByRole('checkbox'));
    expect(screen.getByText('Confirmado')).toBeOnTheScreen();
    await waitFor(() => expect(aoAlternar).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }), true));

    await fireEvent.press(screen.getByRole('checkbox'));
    await waitFor(() => expect(aoAlternar).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'u1' }), false));
});

test('restaura o estado anterior quando a atualização falha', async () => {
    const aoAlternar = jest.fn().mockRejectedValue(new Error('rede'));
    await render(<DailyUseControl uso={{ id: 'u1', horario: '20:00', status: 'pendente' }} aoAlternar={aoAlternar} />);

    await fireEvent.press(screen.getByRole('checkbox'));

    await waitFor(() => expect(screen.getByText('Pendente de uso')).toBeOnTheScreen());
});
