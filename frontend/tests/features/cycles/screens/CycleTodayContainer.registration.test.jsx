import { act, render, waitFor } from '@testing-library/react-native';
import { CycleTodayContainer } from '../../../../src/features/cycles/screens/CycleTodayContainer';

let mockProps;
jest.mock('../../../../src/features/cycles/screens/CycleTodayScreen', () => ({
    CycleTodayScreen: (props) => {
        mockProps = props;
        return null;
    }
}));
jest.mock('../../../../src/features/calendar/utils/cycleCalendar.utils', () => ({
    obterHojeLocal: () => '2026-10-30'
}));

test('encaminha ao cadastro o dia escolhido na Home em vez do dia atual', async () => {
    const abrir = jest.fn();
    const service = {
        buscar: async () => ({ status: 'DISPONIVEL', dataReferencia: '2026-10-30' })
    };
    await render(<CycleTodayContainer service={service} aoCadastrarMenstruacao={abrir} />);
    await waitFor(() => expect(mockProps.carregando).toBe(false));
    await act(() => mockProps.aoSelecionarData('2026-10-27'));
    await act(() => mockProps.aoCadastrarMenstruacao());
    expect(abrir).toHaveBeenCalledWith('2026-10-27');
});

test('Home sem histórico usa hoje como seleção inicial', async () => {
    const abrir = jest.fn();
    const service = { buscar: async () => ({ status: 'DADOS_INSUFICIENTES' }) };
    await render(<CycleTodayContainer service={service} aoCadastrarMenstruacao={abrir} />);
    await waitFor(() => expect(mockProps.carregando).toBe(false));
    await act(() => mockProps.aoCadastrarMenstruacao());
    expect(abrir).toHaveBeenCalledWith('2026-10-30');
});

test('encaminha ao Diário a data selecionada na Home', async () => {
    const abrir = jest.fn();
    const service = {
        buscar: async () => ({ status: 'DISPONIVEL', dataReferencia: '2026-10-30' })
    };
    await render(<CycleTodayContainer service={service} aoCadastrarDiario={abrir} />);
    await waitFor(() => expect(mockProps.carregando).toBe(false));
    await act(() => mockProps.aoSelecionarData('2026-10-24'));
    await act(() => mockProps.aoCadastrarDiario());

    expect(abrir).toHaveBeenCalledWith('2026-10-24');
});

test('preserva o dia selecionado quando a Home renderiza novamente', async () => {
    const service = {
        buscar: jest.fn().mockResolvedValue({
            status: 'DISPONIVEL',
            dataReferencia: '2026-10-30'
        })
    };
    const resultado = await render(
        <CycleTodayContainer service={service} onSessaoExpirada={jest.fn()} />
    );
    await waitFor(() => expect(mockProps.carregando).toBe(false));
    await act(() => mockProps.aoSelecionarData('2026-10-20'));

    await resultado.rerender(
        <CycleTodayContainer service={service} onSessaoExpirada={jest.fn()} />
    );

    expect(mockProps.dataSelecionada).toBe('2026-10-20');
    expect(service.buscar).toHaveBeenCalledTimes(1);
});
