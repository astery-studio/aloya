import { act, render, waitFor } from '@testing-library/react-native';
import { MenstruationRegistrationContainer } from '../../../../src/features/cycles/screens/MenstruationRegistrationContainer';

let mockProps;
jest.mock('../../../../src/features/cycles/screens/MenstruationRegistrationScreen', () => ({
    MenstruationRegistrationScreen: (props) => {
        mockProps = props;
        return null;
    }
}));
jest.mock('../../../../src/features/calendar/utils/cycleCalendar.utils', () => ({
    obterHojeLocal: () => '2026-10-30'
}));

test('pré-preenche a data recebida da Home e permite mudar ou desmarcar sem salvar', async () => {
    const calendarService = { buscarMes: async ({ mes }) => ({ mes, diasMenstruacao: [] }) };
    const fila = { adicionar: jest.fn(), sincronizar: jest.fn() };
    await render(
        <MenstruationRegistrationContainer
            calendarService={calendarService}
            fila={fila}
            dataInicial="2026-10-27"
        />
    );
    await waitFor(() => expect(mockProps.meses).toHaveLength(12));
    expect(mockProps.datasSelecionadas).toEqual(['2026-10-27']);
    await act(() => mockProps.onAlternarData('2026-10-27'));
    expect(mockProps.datasSelecionadas).toEqual([]);
    await act(() => mockProps.onAlternarData('2026-10-28'));
    expect(mockProps.datasSelecionadas).toEqual(['2026-10-28']);
    expect(fila.adicionar).not.toHaveBeenCalled();
});

test.each(['2026-10-31', '2026-02-30'])(
    'não pré-seleciona data futura ou inválida: %s',
    async (dataInicial) => {
        const calendarService = { buscarMes: async ({ mes }) => ({ mes, diasMenstruacao: [] }) };
        await render(
            <MenstruationRegistrationContainer
                calendarService={calendarService}
                fila={{}}
                dataInicial={dataInicial}
            />
        );
        await waitFor(() => expect(mockProps.meses).toHaveLength(12));
        expect(mockProps.datasSelecionadas).toEqual([]);
    }
);

test('dias 2 e 3 permanecem selecionados até um duplo toque iniciar outra faixa no 4', async () => {
    const calendarService = { buscarMes: async ({ mes }) => ({ mes, diasMenstruacao: [] }) };
    const fila = { adicionar: jest.fn(), sincronizar: jest.fn() };
    await render(
        <MenstruationRegistrationContainer
            calendarService={calendarService}
            fila={fila}
            onVoltar={jest.fn()}
        />
    );
    await waitFor(() => expect(mockProps.meses).toHaveLength(12));
    await act(() => mockProps.onAlternarData('2026-10-02'));
    await act(() => mockProps.onAlternarData('2026-10-03'));
    expect(mockProps.datasSelecionadas).toEqual(['2026-10-02', '2026-10-03']);
    await act(() => mockProps.onAlternarData('2026-10-04'));
    expect(mockProps.datasSelecionadas).toEqual(['2026-10-02', '2026-10-03', '2026-10-04']);
    await act(() => mockProps.onIniciarFaixa('2026-10-04'));
    expect(mockProps.datasSelecionadas).toEqual(['2026-10-04']);
    await act(() => mockProps.onAlternarData('2026-10-08'));
    expect(mockProps.datasSelecionadas).toEqual([
        '2026-10-04',
        '2026-10-05',
        '2026-10-06',
        '2026-10-07',
        '2026-10-08'
    ]);
    expect(fila.adicionar).not.toHaveBeenCalled();
});

test('salva primeiro no aparelho, sincroniza sem confirmação intermediária e só então informa sucesso', async () => {
    const calendarService = {
        buscarMes: jest.fn(async ({ mes }) => ({ mes, diasMenstruacao: [] }))
    };
    const fila = {
        adicionar: jest.fn().mockResolvedValue({}),
        sincronizar: jest.fn().mockResolvedValue({})
    };
    const onVoltar = jest.fn();
    await render(
        <MenstruationRegistrationContainer
            calendarService={calendarService}
            fila={fila}
            onVoltar={onVoltar}
        />
    );
    await waitFor(() => expect(mockProps.meses).toHaveLength(12));
    await act(() => mockProps.onAlternarData('2026-10-27'));
    await act(() => mockProps.onAlternarData('2026-10-29'));
    expect(mockProps.datasSelecionadas).toEqual(['2026-10-27', '2026-10-28', '2026-10-29']);
    await act(() => mockProps.onSalvar(mockProps.datasSelecionadas));
    expect(fila.adicionar).toHaveBeenCalledWith('2026-10-27', '2026-10-29');
    expect(fila.adicionar.mock.invocationCallOrder[0]).toBeLessThan(
        fila.sincronizar.mock.invocationCallOrder[0]
    );
    expect(mockProps.sucesso).toBe(true);
    await act(() => mockProps.onFecharFeedback());
    expect(onVoltar).toHaveBeenCalledTimes(1);
});

test('erro de sincronização conserva seleção e nova tentativa inclui a persistência local', async () => {
    const falha = new Error('offline');
    const calendarService = {
        buscarMes: async () => {
            throw falha;
        }
    };
    const fila = {
        adicionar: jest.fn().mockResolvedValue({}),
        sincronizar: jest.fn().mockRejectedValueOnce(falha).mockResolvedValue({})
    };
    await render(
        <MenstruationRegistrationContainer
            calendarService={calendarService}
            fila={fila}
            onVoltar={jest.fn()}
        />
    );
    await waitFor(() => expect(mockProps.meses).toHaveLength(12));
    await act(() => mockProps.onAlternarData('2026-10-30'));
    await act(() => mockProps.onSalvar(mockProps.datasSelecionadas));
    expect(mockProps.erro).toBe(falha);
    expect(mockProps.datasSelecionadas).toEqual(['2026-10-30']);
    await act(() => mockProps.onTentarNovamente());
    expect(mockProps.sucesso).toBe(true);
    expect(fila.adicionar).toHaveBeenCalledTimes(2);
});
