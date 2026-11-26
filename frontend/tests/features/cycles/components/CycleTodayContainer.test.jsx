import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CycleTodayContainer } from '../../../../src/features/cycles/screens/CycleTodayContainer';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

let mockHoje = '2026-10-08';
jest.mock('../../../../src/features/calendar/utils/cycleCalendar.utils', () => ({
    ...jest.requireActual('../../../../src/features/calendar/utils/cycleCalendar.utils'),
    obterHojeLocal: () => mockHoje
}));
jest.mock('phosphor-react-native', () => {
    const { Text } = require('react-native');
    return new Proxy({}, { get: (_, nome) => (props) => <Text {...props}>{String(nome)}</Text> });
});

const previsao = {
    status: 'DISPONIVEL',
    dataReferencia: '2026-10-05',
    proximoInicioEstimado: '2026-10-29',
    dataOvulacaoEstimada: '2026-10-14',
    janelaFertilEstimada: { inicio: '2026-10-09', fim: '2026-10-14' },
    confiabilidadeMenstrual: { nivel: 'MEDIA' },
    fasesEstimadas: {
        menstrual: { inicio: '2026-10-01', fim: '2026-10-05' },
        folicularPosMenstrual: { inicio: '2026-10-06', fim: '2026-10-13' },
        ovulatoria: { data: '2026-10-14' },
        lutea: { inicio: '2026-10-15', fim: '2026-10-28' }
    }
};

const metricasSemInsets = {
    frame: { x: 0, y: 0, width: 390, height: 852 },
    insets: { top: 0, right: 0, bottom: 0, left: 0 }
};

function renderizarTela(propriedades) {
    return render(
        <SafeAreaProvider initialMetrics={metricasSemInsets}>
            <CycleTodayContainer {...propriedades} />
        </SafeAreaProvider>
    );
}

beforeEach(() => {
    mockHoje = '2026-10-08';
});

test('permite tentar novamente depois de uma falha de carregamento', async () => {
    const service = {
        buscar: jest.fn().mockRejectedValueOnce(new Error('falha')).mockResolvedValueOnce(previsao)
    };
    await renderizarTela({ service, aoVoltar: jest.fn() });

    expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();
    await act(async () =>
        fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }))
    );
    await waitFor(() => expect(screen.getByText('29')).toBeOnTheScreen());
    expect(screen.getByText('outubro')).toBeOnTheScreen();
    expect(service.buscar).toHaveBeenCalledTimes(2);
}, 30_000);

test('mantém a faixa de datas estável ao selecionar outro dia', async () => {
    const service = { buscar: jest.fn().mockResolvedValue(previsao) };
    await renderizarTela({ service });

    const primeiroDia = await screen.findByRole('button', { name: 'seg, dia 5' });
    const faixaAntes = screen.getByLabelText('Datas do ciclo').props.data;
    fireEvent.press(screen.getByRole('button', { name: 'qua, dia 14' }));

    expect(primeiroDia).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'seg, dia 5' })).toBeOnTheScreen();
    await waitFor(() => {
        expect(
            screen.getByRole('button', { name: 'qua, dia 14' }).props.accessibilityState
        ).toEqual(expect.objectContaining({ selected: true }));
    });
    expect(screen.getByRole('button', { name: 'Voltar pra hoje' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar pra hoje' }));
    await waitFor(() => {
        expect(screen.getByRole('button', { name: 'qui, dia 8' })).toBeSelected();
    });
    expect(screen.getByLabelText('Datas do ciclo').props.data).toBe(faixaAntes);
}, 30_000);

test('mantém seleção e rolagem horizontal na tela sem ciclo quando a API não encontra registros', async () => {
    const service = {
        buscar: jest.fn().mockResolvedValue({
            status: 'DADOS_INSUFICIENTES',
            motivos: ['INICIO_ELEGIVEL_AUSENTE']
        })
    };
    const aoCadastrarMenstruacao = jest.fn();
    mockHoje = '2026-10-30';
    await renderizarTela({ service, aoCadastrarMenstruacao });

    expect(await screen.findByText('Seu ciclo, sua descoberta.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Datas do ciclo')).toHaveProp('horizontal', true);
    const inicioDaFaixa = screen.getByLabelText('Datas do ciclo').props.data[0].data;
    await fireEvent.press(screen.getByRole('button', { name: 'qui, dia 29' }));
    expect(screen.getByRole('button', { name: 'qui, dia 29' })).toBeSelected();
    expect(screen.getByLabelText('Datas do ciclo').props.data[0].data).toBe(inicioDaFaixa);

    await fireEvent(screen.getByLabelText('Datas do ciclo'), 'scrollEndDrag', {
        nativeEvent: {
            contentOffset: { x: 610, y: 0 },
            contentSize: { width: 1000, height: 94 },
            layoutMeasurement: { width: 390, height: 94 }
        }
    });
    const dias = screen.getByLabelText('Datas do ciclo').props.data;
    expect(dias).toHaveLength(30);
    expect(dias[0].data).toBe(inicioDaFaixa);
    expect(dias.every((dia) => dia.fase === 'desconhecida')).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar Menstruação' }));
    expect(aoCadastrarMenstruacao).toHaveBeenCalledWith('2026-10-29');
    expect(service.buscar).toHaveBeenCalledTimes(1);
});

test('mostra o Diário dentro da rolagem sem ciclo e mantém os atalhos acessíveis', async () => {
    const service = {
        buscar: jest.fn().mockResolvedValue({
            status: 'DADOS_INSUFICIENTES',
            motivos: ['INICIO_ELEGIVEL_AUSENTE']
        })
    };
    const aoCadastrarDiario = jest.fn();
    await renderizarTela({ service, aoCadastrarDiario });

    const rolagem = await screen.findByTestId('conteudo-rolavel');
    expect(within(rolagem).getByTestId('home-sem-ciclo')).toHaveStyle({ gap: 38 });
    const diario = within(rolagem).getByTestId('diario-home-sem-ciclo');
    expect(within(diario).getByText('Seu Diário já está disponível')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /Entenda o ritmo/ })).toHaveProp(
        'accessibilityState',
        expect.objectContaining({ expanded: false })
    );
    await fireEvent.press(
        within(diario).getByRole('button', { name: 'Como você está se sentindo?' })
    );
    expect(aoCadastrarDiario).toHaveBeenCalledTimes(1);
    await fireEvent.press(
        within(diario).getByRole('button', { name: 'Gostaria de fazer uma anotação?' })
    );
    expect(await screen.findByText('O que seu corpo está pedindo agora?')).toBeOnTheScreen();
}, 30_000);

test.each(['ao entrar', 'ao tentar novamente'])(
    'avisa que a sessão expirou %s',
    async (momento) => {
        const falha = Object.assign(new Error('Sessão expirada'), { status: 401 });
        const buscar = jest.fn().mockRejectedValue(falha);
        const onSessaoExpirada = jest.fn();
        if (momento === 'ao tentar novamente') buscar.mockRejectedValueOnce(new Error('Sem rede'));

        await renderizarTela({ service: { buscar }, onSessaoExpirada });

        if (momento === 'ao tentar novamente') {
            const retry = await screen.findByRole('button', { name: 'Tentar novamente' });
            await fireEvent.press(retry);
        }

        await waitFor(() => expect(onSessaoExpirada).toHaveBeenCalledTimes(1));
        expect(screen.queryByText('Algo deu errado')).not.toBeOnTheScreen();
    }
);

test('mantém a Home disponível quando uma consulta cancelada devolve AbortError', async () => {
    const buscar = jest.fn().mockRejectedValue({ name: 'AbortError' });
    const onSessaoExpirada = jest.fn();
    await renderizarTela({ service: { buscar }, onSessaoExpirada });

    expect(await screen.findByText('Seu ciclo, sua descoberta.')).toBeOnTheScreen();
    expect(screen.queryByText('Algo deu errado')).not.toBeOnTheScreen();
    expect(onSessaoExpirada).not.toHaveBeenCalled();
});

test('mantém a mensagem de erro quando a nova tentativa falha', async () => {
    const buscar = jest.fn().mockRejectedValue(new Error('Sem rede'));
    await renderizarTela({ service: { buscar } });

    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();
    expect(buscar).toHaveBeenCalledTimes(2);
});

test('encerra a nova tentativa sem erro se a consulta for cancelada', async () => {
    const buscar = jest
        .fn()
        .mockRejectedValueOnce(new Error('Sem rede'))
        .mockRejectedValueOnce({ name: 'AbortError' });
    await renderizarTela({ service: { buscar } });

    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Seu ciclo, sua descoberta.')).toBeOnTheScreen();
    expect(screen.queryByText('Algo deu errado')).not.toBeOnTheScreen();
    expect(buscar).toHaveBeenCalledTimes(2);
});
