import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ContraceptiveUsageCard, criarUsos } from '../../../../src/features/contraceptives/components/ContraceptiveUsageCard';

test('exibe os dados, horários e ações do cartão', async () => {
    const aoEditar = jest.fn();
    const aoRemover = jest.fn();
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Yaz', tipo: 'pilula', intensidadeAlerta: 'moderado', usoAtrasado: true,
        programacao: { horarios: ['08:00', '20:00'] }, historico: []
    }} aoEditar={aoEditar} aoRemover={aoRemover} />);

    expect(screen.getByText('PRÓXIMOS HORÁRIOS')).toBeOnTheScreen();
    expect(screen.getByText('08:00')).toBeOnTheScreen();
    expect(screen.getByText('20:00')).toBeOnTheScreen();
    expect(screen.getByText('Alerta Moderado')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Editar Yaz' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Remover Yaz' }));
    expect(aoEditar).toHaveBeenCalledTimes(1);
    expect(aoRemover).toHaveBeenCalledTimes(1);
});

test('marca e reverte o uso quando a persistência falha', async () => {
    const aoAlternarUso = jest.fn().mockRejectedValue(new Error('rede'));
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Evra', tipo: 'adesivo', intensidadeAlerta: 'leve',
        usosHoje: [{ id: 'u1', horario: '09:30', status: 'pendente' }], historico: []
    }} aoAlternarUso={aoAlternarUso} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Marcar Uso' })).toBeOnTheScreen());
    expect(aoAlternarUso).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }), expect.objectContaining({ id: 'u1' }), true);
});

test.each(['diu_hormonal'])('não cria marcação diária para %s a partir da programação', (tipo) => {
    expect(criarUsos({ id: '1', tipo, programacao: { horarios: ['08:00'] } })).toEqual([]);
    expect(criarUsos({ id: '1', tipo, usosHoje: [{ id: 'u1', horario: '08:00', status: 'pendente' }] })).toEqual([]);
});

test('o anel permite marcação e desmarcação conforme o protótipo vigente', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{ id: '1', nome: 'NuvaRing', tipo: 'anel_vaginal', usosHoje: [{ id: 'u1', horario: '10:00', status: 'confirmado', horarioConfirmacao: '10:02' }] }} aoAlternarUso={jest.fn().mockResolvedValue()} />);
    expect(screen.getByRole('button', { name: 'Desmarcar Uso' })).toBeOnTheScreen();
    expect(screen.getByText('10:02')).toBeOnTheScreen();
});

test('respeita a lista de usos de hoje vazia enviada pelo fluxo', () => {
    expect(criarUsos({ id: '1', tipo: 'pilula', usosHoje: [], programacao: { horarios: ['08:00'] } })).toEqual([]);
});

test('não apresenta o aviso técnico de prazo ao confirmar uso sem prazo configurado', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'NuvaRing', tipo: 'anel_vaginal',
        usosHoje: [{ id: 'u1', horario: '00:00', status: 'confirmado', horarioConfirmacao: '04:31', prazoConfigurado: false }]
    }} />);
    expect(screen.getByRole('button', { name: 'Desmarcar Uso' })).toBeOnTheScreen();
    expect(screen.queryByText(/Prazo para classificar atraso/)).toBeNull();
});

test('mantém o histórico consultável do anticoncepcional removido e oculta as ações de uso', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Depo-Provera', tipo: 'injetavel', ativo: false,
        usosHoje: [{ id: 'u1', horario: '14:00', status: 'pendente' }],
        historico: [{ id: 'h1', data: '04/09/2026', horarioProgramado: '14:00', estado: 'naoConfirmado' }]
    }} />);

    expect(screen.queryByRole('button', { name: 'Editar Depo-Provera' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Remover Depo-Provera' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Marcar Uso' })).toBeNull();
    expect(screen.queryByText('Pendente de Uso')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Histórico de uso' }));
    expect(screen.getByText('Não houve confirmação')).toBeOnTheScreen();
});

test('publica a atualização imediata e o rollback para sincronizar o banner e a lista', async () => {
    const aoAtualizarUsos = jest.fn();
    const uso = { id: 'u1', horario: '09:30', status: 'pendente' };
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Evra', tipo: 'adesivo', usosHoje: [uso], historico: []
    }} aoAtualizarUsos={aoAtualizarUsos} aoAlternarUso={jest.fn().mockRejectedValue(new Error('rede'))} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    await waitFor(() => expect(aoAtualizarUsos).toHaveBeenCalledTimes(2));
    expect(aoAtualizarUsos.mock.calls[0][1]).toEqual([
        expect.objectContaining({ id: 'u1', status: 'confirmado', confirmadoEm: expect.any(String), horarioConfirmacao: expect.stringMatching(/^\d{2}:\d{2}$/) })
    ]);
    expect(aoAtualizarUsos.mock.calls[1][1]).toEqual([uso]);
});

test('a falha de uma dose não desfaz a confirmação de outra dose independente', async () => {
    let rejeitarPrimeiraDose;
    const aoAlternarUso = jest.fn()
        .mockImplementationOnce(() => new Promise((_, rejeitar) => { rejeitarPrimeiraDose = rejeitar; }))
        .mockResolvedValueOnce();
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Yaz', tipo: 'pilula', usosHoje: [
            { id: 'u1', horario: '08:00', status: 'pendente' },
            { id: 'u2', horario: '20:00', status: 'pendente' }
        ], historico: []
    }} aoAlternarUso={aoAlternarUso} />);

    const primeiraConfirmacao = fireEvent.press(screen.getAllByRole('button', { name: 'Marcar Uso' })[0]);
    await waitFor(() => expect(aoAlternarUso).toHaveBeenCalledTimes(1));
    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    await act(async () => rejeitarPrimeiraDose(new Error('rede')));
    await primeiraConfirmacao;
    expect(screen.getByRole('button', { name: 'Marcar Uso' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Desmarcar Uso' })).toBeOnTheScreen();
    expect(aoAlternarUso.mock.calls[1][1]).toMatchObject({ id: 'u2', horario: '20:00' });
});

test('reflete atualizações de usos recebidas depois da montagem', async () => {
    const anticoncepcional = { id: '1', nome: 'Evra', tipo: 'adesivo', usosHoje: [{ id: 'u1', horario: '09:30', status: 'pendente' }], historico: [] };
    const resultado = await render(<ContraceptiveUsageCard anticoncepcional={anticoncepcional} />);
    expect(screen.getByRole('button', { name: 'Marcar Uso' })).toBeDisabled();

    await resultado.rerender(<ContraceptiveUsageCard anticoncepcional={{ ...anticoncepcional, usosHoje: [{ id: 'u1', horario: '09:30', status: 'confirmado', horarioConfirmacao: '09:32' }] }} />);
    expect(screen.getByRole('button', { name: 'Desmarcar Uso' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Marcar Uso' })).toBeNull();
});

test('o histórico da pílula usa calendário mesmo quando o registro contém o modo de lista', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Yaz', tipo: 'pilula', modoHistorico: 'lista', usosHoje: [],
        historico: [{ data: '04/09/2026', estado: 'confirmado', horarioProgramado: '08:00', horarioConfirmacao: '08:02' }]
    }} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Histórico de uso' }));
    expect(screen.getByTestId('usage-calendar')).toBeOnTheScreen();
    expect(screen.getByText('Setembro 2026')).toBeOnTheScreen();
    expect(screen.queryByText('Horário programado:')).toBeNull();
});

test.each([
    ['injetavel', 'Depo-Provera'],
    ['adesivo', 'Evra'],
    ['anel_vaginal', 'NuvaRing']
])('o histórico de %s usa lista mesmo quando o registro contém o modo de calendário', async (tipo, nome) => {
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome, tipo, modoHistorico: 'calendario', usosHoje: [],
        historico: [{ data: '04/09/2026', estado: 'confirmado', horarioProgramado: '10:00', horarioConfirmacao: '10:02' }]
    }} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Histórico de uso' }));
    expect(screen.queryByTestId('usage-calendar')).toBeNull();
    expect(screen.getByText('04/09/2026')).toBeOnTheScreen();
    expect(screen.getByText('Horário programado:')).toBeOnTheScreen();
    expect(screen.getByText('10:02')).toBeOnTheScreen();
});

test('o anel mantém histórico em lista acessível mesmo sem usos ou registros', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{ id: '1', nome: 'NuvaRing', tipo: 'anel_vaginal' }} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Histórico de uso' }));
    expect(screen.getByRole('button', { name: 'Histórico de uso' })).toHaveProp('accessibilityState', { expanded: true });
    expect(screen.queryByTestId('usage-calendar')).toBeNull();
});

test.each([true, false])('o DIU nunca oferece histórico, inclusive ativo=%s com registros persistidos', async (ativo) => {
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Mirena', tipo: 'diu_hormonal', ativo,
        historico: [{ data: '04/09/2026', estado: 'confirmado' }]
    }} />);
    expect(screen.queryByRole('button', { name: 'Histórico de uso' })).toBeNull();
    expect(screen.queryByTestId('usage-calendar')).toBeNull();
});

test('os badges mantêm sua largura e fonte, com quebra de linha em cartões estreitos', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Yaz', tipo: 'pilula', intensidadeAlerta: 'moderado',
        usosHoje: [{ id: 'u1', horario: '08:00', status: 'pendente' }]
    }} />);
    expect(screen.getByTestId('usage-card-badges')).toHaveStyle({ flexDirection: 'row', flexWrap: 'wrap' });
    expect(screen.getByTestId('usage-card-badge-pendenteDeUso')).toHaveStyle({ minWidth: 118, flexBasis: 118, flexShrink: 0 });
    expect(screen.getByTestId('usage-card-badge-alertaModerado')).toHaveStyle({ minWidth: 118, flexBasis: 118, flexShrink: 0 });
    expect(screen.getByText('Pendente de Uso')).toHaveStyle({ fontSize: 11, lineHeight: 16 });
    expect(screen.getByText('Alerta Moderado')).toHaveStyle({ fontSize: 11, lineHeight: 16 });
});

test('o cartão confirmado distribui badges igualmente a partir do espaço mínimo dos tokens, sem escala', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{ id: '1', nome: 'Mirena', tipo: 'diu_hormonal', intensidadeAlerta: 'leve' }} />);
    expect(screen.getByTestId('usage-card-badge-confirmado')).toHaveStyle({ minWidth: 91, flexBasis: 91, flexShrink: 0 });
    expect(screen.getByTestId('usage-card-badge-alertaLeve')).toHaveStyle({ minWidth: 91, flexBasis: 91, flexShrink: 0 });
});

test('a validade encerrada do DIU não utiliza o badge verde de ainda no prazo', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{
        id: '1', nome: 'Mirena', tipo: 'diu_hormonal', dataValidade: '2026-09-01',
        validadeRestante: 'Validade encerrada', validadeExpirada: true
    }} />);
    expect(screen.getByText('Validade encerrada')).toHaveProp('accessibilityRole', 'alert');
    expect(screen.queryByText('Ainda no prazo')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Marcar Uso' })).toBeNull();
});

test('preserva o alias de alerta crítico com acento ao dimensionar os badges', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{id: '1', nome: 'Mirena', tipo: 'diu_hormonal', intensidadeAlerta: 'crítico'}} />);
    expect(screen.getByLabelText('Alerta Crítico')).toBeOnTheScreen();
});

test('um método desconhecido não oferece um histórico incompatível', async () => {
    await render(<ContraceptiveUsageCard anticoncepcional={{ id: '1', nome: 'Desconhecido', tipo: 'desconhecido', historico: [{ data: '04/09/2026', estado: 'confirmado' }] }} />);
    expect(screen.queryByRole('button', { name: 'Histórico de uso' })).toBeNull();
});

test.each(['25:00', '12:60', '8:00', '', null])('bloqueia a marcação quando o horário presente é inválido: %s', async (horario) => {
    const aoAlternarUso = jest.fn();
    await render(<ContraceptiveUsageCard anticoncepcional={{ id: '1', nome: 'Evra', tipo: 'adesivo', usosHoje: [{ id: 'u1', horario, status: 'pendente' }] }} aoAlternarUso={aoAlternarUso} />);
    expect(screen.getByRole('button', { name: 'Marcar Uso' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    expect(aoAlternarUso).not.toHaveBeenCalled();
});

test('conserva compatibilidade com uso sem horário informado pelo serviço legado', async () => {
    const aoAlternarUso = jest.fn().mockResolvedValue();
    await render(<ContraceptiveUsageCard anticoncepcional={{ id: '1', nome: 'Evra', tipo: 'adesivo', usosHoje: [{ id: 'u1', status: 'pendente' }] }} aoAlternarUso={aoAlternarUso} />);
    expect(screen.getByRole('button', { name: 'Marcar Uso' })).not.toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    expect(aoAlternarUso).toHaveBeenCalledTimes(1);
});
