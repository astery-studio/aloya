import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
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
    await waitFor(() => expect(screen.getByText('29 de outubro')).toBeOnTheScreen());
    expect(service.buscar).toHaveBeenCalledTimes(2);
}, 30_000);

test('mantém a faixa de datas estável ao selecionar outro dia', async () => {
    const service = { buscar: jest.fn().mockResolvedValue(previsao) };
    await renderizarTela({ service });

    const primeiroDia = await screen.findByRole('button', { name: 'sex, dia 2' });
    fireEvent.press(screen.getByRole('button', { name: 'qua, dia 14' }));

    expect(primeiroDia).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'sex, dia 2' })).toBeOnTheScreen();
    await waitFor(() => {
        expect(
            screen.getByRole('button', { name: 'qua, dia 14' }).props.accessibilityState
        ).toEqual(expect.objectContaining({ selected: true }));
    });
}, 30_000);

test('mantém seleção e rolagem horizontal na tela sem ciclo quando a API não encontra registros', async () => {
    const service = {
        buscar: jest.fn().mockResolvedValue({ status: 'DADOS_INSUFICIENTES' })
    };
    const aoCadastrarMenstruacao = jest.fn();
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 30, 23, 30));
    try {
        await renderizarTela({ service, aoCadastrarMenstruacao });

        expect(await screen.findByText('Conheça seu ciclo')).toBeOnTheScreen();
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
