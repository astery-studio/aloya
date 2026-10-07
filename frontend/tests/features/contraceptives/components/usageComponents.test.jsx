import { fireEvent, render, screen } from '@testing-library/react-native';
import { PendingUsesBanner } from '../../../../src/features/contraceptives/components/PendingUsesBanner';
import { UsageCalendar } from '../../../../src/features/contraceptives/components/UsageCalendar';
import { UsageHistoryPanel } from '../../../../src/features/contraceptives/components/UsageHistoryPanel';

test('trata singular, plural e ausência de usos pendentes', async () => {
    const { rerender } = await render(<PendingUsesBanner quantidade={1} />);
    expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen();

    await rerender(<PendingUsesBanner quantidade={2} />);
    expect(screen.getByText('2 usos pendentes hoje')).toBeOnTheScreen();

    await rerender(<PendingUsesBanner quantidade={0} />);
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
});

test('expande e apresenta registros do histórico em lista', async () => {
    const aoAlternar = jest.fn();
    await render(
        <UsageHistoryPanel
            expandido
            registros={[{ id: '1', data: '07/10/2026', horario: '08:00', estado: 'Confirmado' }]}
            aoAlternar={aoAlternar}
        />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Histórico de uso' }));
    expect(aoAlternar).toHaveBeenCalledTimes(1);
    expect(screen.getByText('07/10/2026')).toBeOnTheScreen();
    expect(screen.getByText('08:00')).toBeOnTheScreen();
    expect(screen.getByText('Confirmado')).toBeOnTheScreen();
});

test('apresenta calendário e permite navegar entre meses', async () => {
    const anterior = jest.fn();
    const proximo = jest.fn();
    await render(
        <UsageCalendar
            mes="2026-09"
            dias={[{ dia: 3, estado: 'confirmado' }, { dia: 4, estado: 'foraDoPrazo' }]}
            aoMesAnterior={anterior}
            aoProximoMes={proximo}
        />
    );

    expect(screen.getByText('Setembro 2026')).toBeOnTheScreen();
    expect(screen.getByText('Confirmado')).toBeOnTheScreen();
    expect(screen.getByText('Fora do prazo')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(anterior).toHaveBeenCalledTimes(1);
    expect(proximo).toHaveBeenCalledTimes(1);
});

test('controla o calendário pelo contrato público do painel', async () => {
    await render(
        <UsageHistoryPanel
            expandido
            modo="calendario"
            registros={[{ id: '1', data: '2026-09-03', estado: 'confirmado' }]}
            aoAlternar={jest.fn()}
        />
    );

    expect(screen.getByText('Setembro 2026')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(screen.getByText('Outubro 2026')).toBeOnTheScreen();
});
