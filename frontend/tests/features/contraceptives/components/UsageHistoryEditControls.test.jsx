import { fireEvent, screen } from '@testing-library/react-native';
import { render } from '../mockTheme';
import { UsageHistoryEditControls } from '../../../../src/features/contraceptives/components/UsageHistoryEditControls';

test('anuncia a seleção e bloqueia salvamento sem mudança ou durante o envio', async () => {
    const aoSalvar = jest.fn();
    const aoSelecionarOpcao = jest.fn();
    const props = {
        opcaoSelecionada: 'confirmado', opcoesDisponiveis: ['confirmado', 'foraDoPrazo'],
        aoSalvar, aoSelecionarOpcao
    };
    const { rerender } = await render(<UsageHistoryEditControls {...props} podeSalvar={false} />);
    expect(screen.getByRole('button', { name: 'Confirmado', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Remover', disabled: true })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar', disabled: true })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Fora do prazo' }));
    expect(aoSelecionarOpcao).toHaveBeenCalledWith('foraDoPrazo');

    await rerender(<UsageHistoryEditControls {...props} podeSalvar erro="Tente novamente." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Tente novamente.');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    await rerender(<UsageHistoryEditControls {...props} podeSalvar salvando />);
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar', busy: true, disabled: true }));
    expect(aoSalvar).toHaveBeenCalledTimes(1);
});
