import { fireEvent, screen } from '@testing-library/react-native';
import { render } from '../mockTheme';
import { UsageHistoryPanel } from '../../../../src/features/contraceptives/components/UsageHistoryPanel';

const registros = ['08:00', '20:00'].map((horarioProgramado, indice) => ({
    id: String(indice + 1),
    data: '2026-09-06',
    horarioProgramado,
    confirmadoEm: '2026-09-06T23:00:00.000Z',
    estado: 'confirmado'
}));

async function pressionar(nome) {
    await fireEvent.press(screen.getByRole('button', { name: nome }));
}

test('bloqueia novos usos antes do início e mantém os registros antigos editáveis', async () => {
    const antigo = { ...registros[0], data: '2026-09-04' };
    const salvar = jest.fn().mockResolvedValue({});
    const painel = (inicioMedicacao) => (
        <UsageHistoryPanel
            expandido
            modo="calendario"
            usoUnicoPorDia
            inicioMedicacao={inicioMedicacao}
            horarios={['08:00']}
            registros={[antigo]}
            aoSalvarEdicaoHistorico={salvar}
        />
    );
    const { rerender } = await render(painel('2026-09-06'));

    const anterior = screen.getByRole('button', { name: 'Dia 5, antes do início da medicação' });
    expect(anterior).toBeDisabled();
    await fireEvent.press(anterior);
    expect(screen.queryByRole('button', { name: 'Usei' })).toBeNull();

    await pressionar('Dia 4, Confirmado');
    expect(screen.getByRole('button', { name: 'Apagar registro' })).toBeEnabled();
    await pressionar('Não usei');
    await pressionar('Salvar');
    expect(salvar).toHaveBeenLastCalledWith(antigo, { estado: 'naoUsei' });

    await rerender(painel('2026-09-05'));
    await pressionar('Dia 5, início da medicação');
    await pressionar('Usei');
    await pressionar('Salvar');
    expect(salvar).toHaveBeenLastCalledWith(
        expect.objectContaining({ novo: true, data: '2026-09-05' }),
        { estado: 'confirmado' }
    );
});

test('calendário exige um horário quando há duas ocorrências no mesmo dia', async () => {
    const salvar = jest.fn().mockResolvedValue({});
    await render(
        <UsageHistoryPanel
            expandido
            modo="calendario"
            registros={registros}
            aoSalvarEdicaoHistorico={salvar}
        />
    );

    await pressionar('Alterar Histórico');
    await pressionar('Dia 6, Confirmado');

    expect(
        screen.getByText('Há mais de um uso neste dia. Toque no horário que deseja alterar.')
    ).toBeOnTheScreen();
    expect(
        screen.getByRole('button', { name: 'Usei fora do prazo', disabled: true })
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar', disabled: true })).toBeOnTheScreen();

    await pressionar('06/09/2026, 20:00, Confirmado');
    expect(screen.getByText('Horário selecionado: 20:00')).toBeOnTheScreen();

    await pressionar('Usei fora do prazo');
    await pressionar('Salvar');

    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar).toHaveBeenCalledWith(registros[1], { estado: 'foraDoPrazo' });
    expect(await screen.findByRole('button', { name: 'Alterar Histórico' })).toBeOnTheScreen();
});

test('explica um limite temporário sem perder o registro selecionado', async () => {
    const mensagem = 'Muitas alterações em pouco tempo. Aguarde e tente novamente.';
    const salvar = jest.fn().mockRejectedValue({ status: 429, mensagemUsuario: mensagem });
    await render(
        <UsageHistoryPanel
            expandido
            modo="calendario"
            usoUnicoPorDia
            registros={[registros[0]]}
            aoSalvarEdicaoHistorico={salvar}
        />
    );

    await pressionar('Dia 6, Confirmado');
    await pressionar('Apagar registro');
    await pressionar('Apagar');

    expect(await screen.findByText(mensagem)).toBeOnTheScreen();
    await pressionar('OK');
    expect(
        screen.getByRole('button', { name: 'Dia 6, Confirmado', selected: true })
    ).toBeOnTheScreen();
});

test('desabilita dias sem opções e deixa editar os registros existentes', async () => {
    await render(
        <UsageHistoryPanel
            expandido
            modo="calendario"
            registros={[registros[0]]}
            aoSalvarEdicaoHistorico={jest.fn()}
        />
    );

    await pressionar('Alterar Histórico');
    const indisponivel = screen.getByRole('button', { name: 'Dia 5, sem registro' });
    expect(indisponivel).toBeDisabled();
    await fireEvent.press(indisponivel);
    expect(screen.queryByText('Dia indisponível')).toBeNull();

    await pressionar('Dia 6, Confirmado');
    expect(screen.getByRole('button', { name: 'Usei', selected: true })).toBeOnTheScreen();

    await pressionar('Usei fora do prazo');
    expect(screen.getByRole('button', { name: 'Salvar', disabled: false })).toBeOnTheScreen();
});

test('o modal de descarte mantém ou descarta o rascunho conforme a ação escolhida', async () => {
    await render(
        <UsageHistoryPanel
            expandido
            modo="calendario"
            registros={[registros[0]]}
            aoSalvarEdicaoHistorico={jest.fn()}
        />
    );

    await pressionar('Alterar Histórico');
    await pressionar('Dia 6, Confirmado');
    await pressionar('Usei fora do prazo');
    await pressionar('Próximo mês');

    expect(screen.getByText('Descartar alteração?')).toBeOnTheScreen();

    await pressionar('Continuar editando');
    expect(
        screen.getByRole('button', { name: 'Usei fora do prazo', selected: true })
    ).toBeOnTheScreen();

    await pressionar('Próximo mês');
    await pressionar('Descartar');

    expect(screen.getByText('Outubro 2026')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar', disabled: true })).toBeOnTheScreen();
});

test('lista conserva o registro e a opção após falha e permite nova tentativa', async () => {
    const salvar = jest.fn().mockRejectedValueOnce(new Error()).mockResolvedValueOnce({});
    await render(
        <UsageHistoryPanel expandido registros={registros} aoSalvarEdicaoHistorico={salvar} />
    );

    await pressionar('Alterar Histórico');
    await pressionar('06/09/2026, 08:00, Confirmado');
    await pressionar('Usei fora do prazo');
    await pressionar('Salvar');

    expect(await screen.findByRole('alert')).toHaveTextContent(
        'Não foi possível salvar. Tente novamente.'
    );
    expect(
        screen.getByRole('button', { name: 'Usei fora do prazo', selected: true })
    ).toBeOnTheScreen();

    await pressionar('Salvar');

    expect(salvar).toHaveBeenCalledTimes(2);
    expect(salvar).toHaveBeenLastCalledWith(registros[0], { estado: 'foraDoPrazo' });
});

test('a lista permite editar um registro passado sem confirmação', async () => {
    const confirmado = registros[0];
    const semConfirmacao = { ...registros[1], estado: 'naoConfirmado', confirmadoEm: null };
    await render(
        <UsageHistoryPanel
            expandido
            registros={[confirmado, semConfirmacao]}
            aoSalvarEdicaoHistorico={jest.fn()}
        />
    );

    await pressionar('Alterar Histórico');
    expect(screen.getByText('Não houve confirmação')).toBeOnTheScreen();

    await pressionar('06/09/2026, 20:00, Não confirmado');
    await pressionar('Usei fora do prazo');

    expect(screen.getByRole('button', { name: 'Salvar', disabled: false })).toBeOnTheScreen();
});

test('abre um dia passado sem registro, escolhe um horário e salva a correção', async () => {
    const salvar = jest.fn().mockResolvedValue({});
    await render(
        <UsageHistoryPanel
            expandido
            modo="calendario"
            registros={[registros[0]]}
            horarios={['08:00', '20:00']}
            aoSalvarEdicaoHistorico={salvar}
        />
    );

    await pressionar('Alterar Histórico');
    await pressionar('Dia 5, sem registro');

    expect(screen.queryByText('Dia indisponível')).toBeNull();

    await pressionar('05/09/2026, 20:00, Sem confirmação');
    expect(screen.queryByRole('button', { name: 'Apagar registro' })).toBeNull();

    await pressionar('Usei');
    await pressionar('Salvar');

    expect(salvar).toHaveBeenCalledWith(
        expect.objectContaining({ novo: true, data: '2026-09-05', horarioProgramado: '20:00' }),
        { estado: 'confirmado' }
    );
});

test('na pílula, edita o horário antigo salvo sem oferecer o horário atual no mesmo dia', async () => {
    const antigo = { ...registros[1], estado: 'naoConfirmado', confirmadoEm: null };
    const salvar = jest.fn().mockResolvedValue({});
    await render(
        <UsageHistoryPanel
            expandido
            modo="calendario"
            usoUnicoPorDia
            registros={[antigo]}
            horarios={['08:00']}
            aoSalvarEdicaoHistorico={salvar}
        />
    );

    expect(screen.queryByRole('button', { name: 'Alterar Histórico' })).toBeNull();
    const calendario = screen.getByTestId('usage-calendar');
    expect(screen.getByTestId('usage-calendar-legend')).toBeOnTheScreen();

    await pressionar('Dia 6, Não confirmado');

    expect(screen.getByTestId('usage-calendar')).toBe(calendario);
    expect(screen.queryByTestId('usage-calendar-legend')).toBeNull();
    expect(
        screen.getByRole('button', { name: 'Dia 6, Não confirmado', selected: true })
    ).toBeOnTheScreen();
    expect(screen.queryByText('Horário programado:')).toBeNull();

    await pressionar('Não usei');
    await pressionar('Salvar');

    expect(salvar).toHaveBeenCalledWith(antigo, { estado: 'naoUsei' });
    expect(screen.getByTestId('usage-calendar')).toBe(calendario);
    expect(screen.getByTestId('usage-calendar-legend')).toBeOnTheScreen();

    await pressionar('Dia 5, sem registro');
    expect(
        screen.getByRole('button', { name: 'Dia 5, sem registro', selected: true })
    ).toBeOnTheScreen();

    await pressionar('Usei');
    await pressionar('Salvar');

    expect(salvar).toHaveBeenLastCalledWith(
        expect.objectContaining({ novo: true, data: '2026-09-05', horarioProgramado: '08:00' }),
        { estado: 'confirmado' }
    );
});

test('na pílula, uma resposta salva tem prioridade sobre outra ocorrência sem confirmação', async () => {
    const automatico = { ...registros[0], estado: 'naoConfirmado', confirmadoEm: null };
    await render(
        <UsageHistoryPanel
            expandido
            modo="calendario"
            usoUnicoPorDia
            registros={[automatico, registros[1]]}
            horarios={['08:00']}
            aoSalvarEdicaoHistorico={jest.fn()}
        />
    );

    await pressionar('Dia 6, Confirmado');
    expect(screen.getByRole('button', { name: 'Usei', selected: true })).toBeOnTheScreen();
});

test('salva Não usei e apresenta a opção legada de dúvida como Não confirmado', async () => {
    const anterior = {
        ...registros[0],
        data: '2026-09-04',
        id: '3',
        estado: 'naoSei',
        confirmadoEm: null
    };
    const salvo = { ...registros[0], estado: 'naoUsei', confirmadoEm: null };
    const salvar = jest.fn().mockResolvedValue(salvo);
    const painel = (itens) => (
        <UsageHistoryPanel
            expandido
            modo="calendario"
            registros={itens}
            aoSalvarEdicaoHistorico={salvar}
        />
    );
    const { rerender } = await render(painel([registros[0], anterior]));

    await pressionar('Alterar Histórico');
    await pressionar('Dia 6, Confirmado');

    expect(screen.queryByRole('button', { name: 'Não confirmado' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Não sei' })).toBeNull();

    await pressionar('Não usei');
    await pressionar('Salvar');

    expect(salvar).toHaveBeenCalledWith(registros[0], { estado: 'naoUsei' });

    await rerender(painel([salvo, anterior]));

    expect(screen.getByLabelText('Dia 6, Não usei')).toBeOnTheScreen();
    expect(screen.getByLabelText('Dia 4, Não confirmado')).toBeOnTheScreen();
});
