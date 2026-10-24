import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState } from 'react-native';
import { ContraceptiveFlow } from '../../../../src/features/contraceptives/ContraceptiveFlow';
import { criarContraceptiveService } from '../../../../src/features/contraceptives/services/contraceptiveService';

const metricas = { frame: { x: 0, y: 0, width: 393, height: 852 }, insets: { top: 32, left: 0, right: 0, bottom: 24 } };
const registro = {
    id: 1, nome: 'Yaz', tipo: 'pilula', intensidadeAlerta: 'moderado', horarios: ['08:00', '20:00'],
    frequenciaId: 'pilula_continuo', dataPrimeiroUso: '2026-10-01',
    usosHoje: [
        { id: '2026-10-09-08:00', data: '2026-10-09', horario: '08:00', status: 'pendente' },
        { id: '2026-10-09-20:00', data: '2026-10-09', horario: '20:00', status: 'pendente' }
    ], historico: []
};
const renderizar = (props) => render(<SafeAreaProvider initialMetrics={metricas}><ContraceptiveFlow {...props} /></SafeAreaProvider>);

function promessaControlada() {
    let resolver;
    let rejeitar;
    const promessa = new Promise((res, rej) => { resolver = res; rejeitar = rej; });
    return { promessa, resolver, rejeitar };
}

// Fecha o act do toque antes de consultar o feedback otimista.
// A promessa da persistência fica separada e será aguardada no act da resposta.
async function iniciarPressao(elemento) {
    let evento;
    await act(async () => { evento = fireEvent.press(elemento); });
    return { evento };
}

afterEach(() => jest.restoreAllMocks());

test('API → normalizador → tela: confirma, atualiza histórico/calendário e desmarca sem recarregar', async () => {
    const confirmadoEm = '2026-10-09T12:34:56.789Z';
    const requisicaoAutenticada = jest.fn().mockResolvedValueOnce({ anticoncepcionais: [registro] })
        .mockResolvedValueOnce({ uso: { id: 10, data: '2026-10-09', horario: '08:00', status: 'foraDoPrazo', confirmadoEm, confirmacaoForaPrazo: true, prazoConfigurado: true } })
        .mockResolvedValueOnce({ uso: { id: 10, data: '2026-10-09', horario: '08:00', status: 'pendente', confirmadoEm: null, prazoConfigurado: true } });
    await renderizar({ service: criarContraceptiveService({ requisicaoAutenticada }) });
    await screen.findByText('2 usos pendentes hoje');
    await fireEvent.press(screen.getAllByRole('button', { name: 'Marcar Uso' })[0]);
    await waitFor(() => expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: 'Histórico de uso' }));
    expect(screen.getByLabelText('Dia 9, Fora do prazo')).toBeOnTheScreen();
    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(2, expect.objectContaining({
        metodo: 'PUT', caminho: '/api/anticoncepcionais/1/usos', corpo: expect.objectContaining({ data: '2026-10-09', horario: '08:00', confirmar: true })
    }));
    await fireEvent.press(screen.getByRole('button', { name: 'Desmarcar Uso' }));
    await waitFor(() => expect(screen.getByText('2 usos pendentes hoje')).toBeOnTheScreen());
    expect(screen.getByLabelText('Dia 9, sem registro')).toBeOnTheScreen();
    expect(requisicaoAutenticada).toHaveBeenCalledTimes(3);
});

test('a Home tem controles por horário, mantém DIU sem marcação e publica feedback antes da resposta', async () => {
    let resolver;
    const aguardar = new Promise((res) => { resolver = res; });
    const service = { listar: jest.fn().mockResolvedValue([
        { ...registro, id: '1', programacao: { horarios: registro.horarios } },
        { id: '2', nome: 'Mirena', tipo: 'diu_hormonal', dataValidade: '2029-03-14', usosHoje: [] }
    ]), alternarUso: jest.fn().mockReturnValue(aguardar) };
    await renderizar({ service, inicio: true });
    await screen.findByText('Anticoncepcionais de hoje');
    await screen.findByText('2 usos pendentes hoje');
    expect(screen.getAllByRole('button', { name: 'Marcar Uso' })).toHaveLength(2);
    const { evento: acao } = await iniciarPressao(screen.getAllByRole('button', { name: 'Marcar Uso' })[0]);
    await waitFor(() => expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen());
    await act(async () => {
        resolver({ uso: { id: '10', data: '2026-10-09', horario: '08:00', status: 'confirmado', confirmadoEm: '2026-10-09T12:00:00Z' } });
        await acao;
    });
    expect(screen.getByTestId('usos-home-area-segura')).toHaveProp('edges', { top: 'additive', left: 'additive', right: 'additive', bottom: 'additive' });
    const mirena = screen.getByLabelText('Mirena, DIU hormonal');
    expect(within(mirena).queryByRole('button', { name: 'Marcar Uso' })).toBeNull();
    expect(within(mirena).queryByRole('button', { name: 'Histórico de uso' })).toBeNull();
});

test('erro de rede desfaz apenas a tentativa e não informa sucesso sem persistência', async () => {
    const service = { listar: jest.fn().mockResolvedValue([{ ...registro, id: '1' }]), alternarUso: jest.fn().mockRejectedValue(new Error('rede')) };
    await renderizar({ service });
    await screen.findByText('2 usos pendentes hoje');
    await fireEvent.press(screen.getAllByRole('button', { name: 'Marcar Uso' })[0]);
    await waitFor(() => expect(screen.getByText('2 usos pendentes hoje')).toBeOnTheScreen());
    expect(screen.queryByRole('button', { name: 'Desmarcar Uso' })).toBeNull();
});

test('a trava por dose permanece após mover o cartão entre seções e impede uma reversão concorrente', async () => {
    const confirmacao = promessaControlada();
    const unicoUso = { ...registro, id: '1', usosHoje: [registro.usosHoje[0]] };
    const service = { listar: jest.fn().mockResolvedValue([unicoUso]), alternarUso: jest.fn().mockReturnValue(confirmacao.promessa) };
    await renderizar({ service });
    await screen.findByText('1 uso pendente hoje');
    const { evento: marcar } = await iniciarPressao(screen.getByRole('button', { name: 'Marcar Uso' }));
    await screen.findByRole('button', { name: 'Desmarcar Uso' });
    await fireEvent.press(screen.getByRole('button', { name: 'Desmarcar Uso' }));
    expect(service.alternarUso).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Desmarcar Uso' })).toBeOnTheScreen();
    await act(async () => {
        confirmacao.resolver({ uso: { id: '10', data: '2026-10-09', horario: '08:00', status: 'confirmado', confirmadoEm: '2026-10-09T12:00:00Z' } });
        await marcar;
    });
    expect(screen.queryByText('1 uso pendente hoje')).toBeNull();
});

test('dois horários distintos podem persistir em paralelo sem perder a confirmação do outro', async () => {
    const primeira = promessaControlada();
    const segunda = promessaControlada();
    const service = { listar: jest.fn().mockResolvedValue([{ ...registro, id: '1' }]), alternarUso: jest.fn().mockImplementation(({ horario }) => horario === '08:00' ? primeira.promessa : segunda.promessa) };
    await renderizar({ service });
    await screen.findByText('2 usos pendentes hoje');
    const { evento: marcarPrimeira } = await iniciarPressao(screen.getAllByRole('button', { name: 'Marcar Uso' })[0]);
    await screen.findByText('1 uso pendente hoje');
    const { evento: marcarSegunda } = await iniciarPressao(screen.getByRole('button', { name: 'Marcar Uso' }));
    await waitFor(() => expect(service.alternarUso).toHaveBeenCalledTimes(2));
    await act(async () => {
        segunda.resolver({ uso: { id: '20', data: '2026-10-09', horario: '20:00', status: 'confirmado', confirmadoEm: '2026-10-10T00:00:00Z' } });
        await marcarSegunda;
    });
    await act(async () => {
        primeira.resolver({ uso: { id: '10', data: '2026-10-09', horario: '08:00', status: 'confirmado', confirmadoEm: '2026-10-09T12:00:00Z' } });
        await marcarPrimeira;
    });
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Desmarcar Uso' })).toHaveLength(2));
    expect(screen.queryByText('1 uso pendente hoje')).toBeNull();
    expect(screen.queryByText('2 usos pendentes hoje')).toBeNull();
});

test.each([true, false])('uma busca antiga não sobrescreve confirmação ou rollback: sucesso=%s', async (sucesso) => {
    const buscaAntiga = promessaControlada();
    const confirmacao = promessaControlada();
    let aoAppState;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((evento, callback) => { aoAppState = callback; return { remove: jest.fn() }; });
    const itens = [{ ...registro, id: '1', usosHoje: [registro.usosHoje[0]] }];
    const service = { listar: jest.fn().mockResolvedValueOnce(itens).mockReturnValueOnce(buscaAntiga.promessa), alternarUso: jest.fn().mockReturnValue(confirmacao.promessa) };
    await renderizar({ service });
    await screen.findByText('1 uso pendente hoje');
    await act(async () => aoAppState('active'));
    const { evento: tentativa } = await iniciarPressao(screen.getByRole('button', { name: 'Marcar Uso' }));
    await screen.findByRole('button', { name: 'Desmarcar Uso' });
    await act(async () => {
        if (sucesso) confirmacao.resolver({ uso: { id: '10', data: '2026-10-09', horario: '08:00', status: 'confirmado', confirmadoEm: '2026-10-09T12:00:00Z' } });
        else confirmacao.rejeitar(new Error('rede'));
        await tentativa;
    });
    const snapshot = sucesso ? itens : [{ ...itens[0], usosHoje: [{ ...registro.usosHoje[0], status: 'confirmado', confirmadoEm: '2026-10-09T10:00:00Z' }] }];
    await act(async () => buscaAntiga.resolver(snapshot));
    if (sucesso) expect(screen.getByRole('button', { name: 'Desmarcar Uso' })).toBeOnTheScreen();
    else expect(screen.getByRole('button', { name: 'Marcar Uso' })).toBeOnTheScreen();
});
