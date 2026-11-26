import { fireEvent, screen } from '@testing-library/react-native';
import { render } from '../mockTheme';
import { UsageHistoryEditControls } from '../../../../src/features/contraceptives/components/UsageHistoryEditControls';

test('anuncia a seleção e bloqueia salvamento sem mudança ou durante o envio', async () => {
    const aoSalvar = jest.fn();
    const aoSelecionarOpcao = jest.fn();
    const props = {
        opcaoSelecionada: 'confirmado',
        opcoesDisponiveis: ['confirmado', 'foraDoPrazo'],
        aoSalvar,
        aoSelecionarOpcao
    };
    const { rerender } = await render(<UsageHistoryEditControls {...props} podeSalvar={false} />);

    expect(screen.getByRole('button', { name: 'Usei', selected: true })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Apagar registro' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Salvar', disabled: true })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Usei fora do prazo' }));
    expect(aoSelecionarOpcao).toHaveBeenCalledWith('foraDoPrazo');

    await rerender(<UsageHistoryEditControls {...props} podeSalvar erro="Tente novamente." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Tente novamente.');

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    await rerender(<UsageHistoryEditControls {...props} podeSalvar salvando />);
    await fireEvent.press(
        screen.getByRole('button', { name: 'Salvar', busy: true, disabled: true })
    );

    expect(aoSalvar).toHaveBeenCalledTimes(1);
});

test('ordena as opções para manter Usei e Não usei juntas e inclui Apagar registro no grupo', async () => {
    const aoApagarRegistro = jest.fn();
    const props = {
        opcoesDisponiveis: ['confirmado', 'naoUsei', 'foraDoPrazo'],
        aoApagarRegistro
    };
    const { rerender } = await render(<UsageHistoryEditControls {...props} />);

    const botoes = screen.getAllByRole('button');
    expect(botoes).toEqual(
        ['Usei', 'Não usei', 'Usei fora do prazo', 'Apagar registro', 'Salvar'].map((name) =>
            screen.getByRole('button', { name })
        )
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Apagar registro' }));
    expect(aoApagarRegistro).toHaveBeenCalledTimes(1);

    await rerender(<UsageHistoryEditControls {...props} salvando />);
    expect(
        screen.getByRole('button', { name: 'Apagar registro', disabled: true })
    ).toBeOnTheScreen();
});
