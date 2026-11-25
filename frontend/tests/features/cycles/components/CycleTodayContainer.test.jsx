import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CycleTodayContainer } from '../../../../src/features/cycles/screens/CycleTodayContainer';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

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

    const primeiroDia = await screen.findByRole('button', { name: 'sex, dia 2' });
    const faixaAntes = screen.getByLabelText('Datas do ciclo').props.data;
    fireEvent.press(screen.getByRole('button', { name: 'qua, dia 14' }));

    expect(primeiroDia).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'sex, dia 2' })).toBeOnTheScreen();
    await waitFor(() => {
        expect(
            screen.getByRole('button', { name: 'qua, dia 14' }).props.accessibilityState
        ).toEqual(expect.objectContaining({ selected: true }));
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
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 30, 23, 30));
    try {
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
    } finally {
        jest.useRealTimers();
    }
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
