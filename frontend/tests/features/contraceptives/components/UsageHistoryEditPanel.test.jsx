import { fireEvent, screen } from '@testing-library/react-native';
import { render } from '../mockTheme';
import { UsageHistoryPanel } from '../../../../src/features/contraceptives/components/UsageHistoryPanel';

const registros = ['08:00', '20:00'].map((horarioProgramado, indice) => ({
    id: String(indice + 1), data: '2026-09-06', horarioProgramado,
    confirmadoEm: '2026-09-06T23:00:00.000Z', estado: 'confirmado'
}));

async function pressionar(nome) {
    await fireEvent.press(screen.getByRole('button', { name: nome }));
}

test('calendário exige um horário quando há duas ocorrências no mesmo dia', async () => {
    const salvar = jest.fn().mockResolvedValue({});
    await render(<UsageHistoryPanel expandido modo="calendario" registros={registros} aoSalvarEdicaoHistorico={salvar} />);
    await pressionar('Alterar Histórico');
    await pressionar('Dia 6, Confirmado');
    expect(screen.getByText('Há mais de um uso neste dia. Toque no horário que deseja alterar.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Usei fora do prazo', disabled: true })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar', disabled: true })).toBeOnTheScreen();
    await pressionar('06/09/2026, 20:00, Confirmado');
    expect(screen.getByText('Horário selecionado: 20:00')).toBeOnTheScreen();
    await pressionar('Usei fora do prazo');
    await pressionar('Salvar');
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(registros[1], { estado: 'foraDoPrazo' });
    expect(await screen.findByRole('button', { name: 'Alterar Histórico' })).toBeOnTheScreen();
});

test('explica dias indisponíveis e habilita as opções ao tocar em um dia com um único uso', async () => {
    await render(<UsageHistoryPanel expandido modo="calendario" registros={[registros[0]]}
        aoSalvarEdicaoHistorico={jest.fn()} />);
    await pressionar('Alterar Histórico');
    await pressionar('Dia 5, sem registro');
    expect(screen.getByText('Dia indisponível')).toBeOnTheScreen();
    await pressionar('OK');
    expect(screen.queryByText('Dia indisponível')).toBeNull();
    await pressionar('Dia 6, Confirmado');
    expect(screen.getByRole('button', { name: 'Usei', selected: true })).toBeOnTheScreen();
    await pressionar('Usei fora do prazo');
    expect(screen.getByRole('button', { name: 'Salvar', disabled: false })).toBeOnTheScreen();
});

test('o modal de descarte mantém ou descarta o rascunho conforme a ação escolhida', async () => {
    await render(<UsageHistoryPanel expandido modo="calendario" registros={[registros[0]]}
        aoSalvarEdicaoHistorico={jest.fn()} />);
    await pressionar('Alterar Histórico');
    await pressionar('Dia 6, Confirmado');
    await pressionar('Usei fora do prazo');
    await pressionar('Próximo mês');
    expect(screen.getByText('Descartar alteração?')).toBeOnTheScreen();
    await pressionar('Continuar editando');
    expect(screen.getByRole('button', { name: 'Usei fora do prazo', selected: true })).toBeOnTheScreen();
    await pressionar('Próximo mês');
    await pressionar('Descartar');
    expect(screen.getByText('Outubro 2026')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar', disabled: true })).toBeOnTheScreen();
});

test('lista conserva o registro e a opção após falha e permite nova tentativa', async () => {
    const salvar = jest.fn().mockRejectedValueOnce(new Error()).mockResolvedValueOnce({});
    await render(<UsageHistoryPanel expandido registros={registros} aoSalvarEdicaoHistorico={salvar} />);
    await pressionar('Alterar Histórico');
    await pressionar('06/09/2026, 08:00, Confirmado');
    await pressionar('Usei fora do prazo');
    await pressionar('Salvar');
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar. Tente novamente.');
    expect(screen.getByRole('button', { name: 'Usei fora do prazo', selected: true })).toBeOnTheScreen();
    await pressionar('Salvar');
    expect(salvar).toHaveBeenCalledTimes(2);
    expect(salvar).toHaveBeenLastCalledWith(registros[0], { estado: 'foraDoPrazo' });
});
